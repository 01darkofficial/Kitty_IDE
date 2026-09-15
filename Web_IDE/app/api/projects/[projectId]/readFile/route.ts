import { createServerSupabase } from "@/lib/supabase/supabaseServer"

const RUNTIME_API_URL = process.env.RUNTIME_SERVER_URL

if (!RUNTIME_API_URL) {
    throw new Error("Missing RUNTIME_API_URL")
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { fileId } = body

        /*
        Fetch metadata tree
        */

        const { data: allFiles } = await supabase.from("files").select("*").eq("project_id", projectId)
        const file = allFiles!.find(f => f.id === fileId)

        if (!file) {
            return Response.json(
                { error: "File not found" },
                { status: 404 }
            )
        }

        // Reading file from runtime server
        const runtimeServerResponse = await fetch(`${RUNTIME_API_URL}/files/read`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                projectId,
                fileId,
                allFiles
            })
        })

        const data = await runtimeServerResponse.json()

        return Response.json(data)
    } catch (err) {
        console.error("READ ROUTE ERROR:", err)
        return Response.json(
            { error: "failed to read file" },
            { status: 500 }
        )
    }
}