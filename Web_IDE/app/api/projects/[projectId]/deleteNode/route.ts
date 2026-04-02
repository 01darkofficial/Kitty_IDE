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
        const { ids } = body

        if (!ids?.length) {
            return Response.json(
                { error: "No ids provided" },
                { status: 400 }
            )
        }

        /*
        Fetch all files once
        */

        const { data: allFiles } = await supabase.from("files").select("*").eq("project_id", projectId)

        /*
        Filter target files
        */

        const filesToDelete = allFiles!.filter(f => ids.includes(f.id))

        /*
        Delete on disk FIRST
        */

        const proxyResponse = await fetch(`${process.env.PROXY_URL}/files/delete`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    projectId,
                    files: filesToDelete,
                    allFiles
                })
            }
        )

        if (!proxyResponse.ok) {
            return Response.json(
                { error: "Disk delete failed" },
                { status: 500 }
            )
        }

        /*
        Delete metadata from DB
        */

        await supabase.from("files").delete().in("id", ids)

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