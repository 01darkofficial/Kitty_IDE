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
        const { fileIds } = body

        if (!fileIds?.length) {
            return Response.json(
                { error: "No ids provided" },
                { status: 400 }
            )
        }

        // Fetch all files once
        const { data: allFiles } = await supabase.from("files").select("*").eq("project_id", projectId)

        // Delete on disk first
        const runtimeServerResponse = await fetch(`${process.env.RUNTIME_SERVER_URL}/files/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                projectId,
                fileIds,
                allFiles
            })
        })

        if (!runtimeServerResponse.ok) {
            return Response.json(
                { error: "Disk delete failed" },
                { status: 500 }
            )
        }

        // Delete metadata from DB
        await supabase.from("files").delete().in("id", fileIds)

        return Response.json({
            success: true
        })

    } catch (err) {
        console.error("DELETE ROUTE ERROR:", err)
        return Response.json(
            { error: "failed to delete file" },
            { status: 500 }
        )
    }
}