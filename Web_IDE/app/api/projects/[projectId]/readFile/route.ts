import { createServerSupabase } from "@/lib/supabase/supabaseServer"

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
        const { id } = body

        /*
        Fetch metadata tree
        */

        const { data: allFiles } = await supabase.from("files").select("*").eq("project_id", projectId)
        const file = allFiles!.find(f => f.id === id)

        if (!file) {
            return Response.json(
                { error: "File not found" },
                { status: 404 }
            )
        }

        /*
        Call proxy
        */

        const proxyResponse = await fetch(`${process.env.PROXY_URL}/files/read`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    projectId,
                    file,
                    allFiles
                })
            }
        )

        const data = await proxyResponse.json()

        return Response.json(data)
    } catch (err) {
        console.error("READ ROUTE ERROR:", err)
        return Response.json(
            { error: "failed to read file" },
            { status: 500 }
        )
    }
}