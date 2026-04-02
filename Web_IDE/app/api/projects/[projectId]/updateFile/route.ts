import { createServerSupabase } from "@/lib/supabase/supabaseServer"
import { updateFileSchema } from "@/lib/validation/file"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params
        const supabase = await createServerSupabase()
        const { data: { user }, } = await supabase.auth.getUser()

        if (!user) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        /*
        Parse request
        */

        const body = await req.json()
        const parsed = updateFileSchema.safeParse(body)

        if (!parsed.success) {
            return Response.json(
                { error: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { id, content } = parsed.data

        /*
        Fetch full file tree
        */

        const { data: allFiles, error: treeError } = await supabase.from("files").select("*").eq("project_id", projectId)

        if (treeError) {
            return Response.json(
                { error: treeError.message },
                { status: 500 }
            )
        }

        /*
        Find file metadata
        */

        const file = allFiles.find((f) => f.id === id)

        if (!file) {
            return Response.json(
                { error: "File not found" },
                { status: 404 }
            )
        }

        /*
        Call proxy to update disk
        */

        const proxyResponse = await fetch(`${process.env.PROXY_URL}/files/update`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    projectId,
                    file,
                    allFiles,
                    content
                })
            }
        )

        if (!proxyResponse.ok) {
            console.error("Proxy update failed:", await proxyResponse.text())
            return Response.json(
                { error: "Disk update failed" },
                { status: 500 }
            )
        }

        /*
        Update only updated_at in DB
        */

        const { error: updateError } = await supabase.from("files").update({
            updated_at: new Date().toISOString()
        }).eq("id", id).eq("project_id", projectId)

        if (updateError) {
            return Response.json(
                { error: updateError.message },
                { status: 500 }
            )
        }

        /*
        Success
        */

        return Response.json({
            success: true
        })

    } catch (err) {
        console.error("UPDATE ROUTE ERROR:", err)
        return Response.json(
            { error: "Unexpected server error" },
            { status: 500 }
        )
    }
}