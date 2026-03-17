import { createServerSupabase } from "@/lib/supabase/supabaseServer"
import { updateFileSchema } from "@/lib/validation/file"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {

    const { projectId } = await params

    const supabase = await createServerSupabase()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const body = await req.json()

    const parsed = updateFileSchema.safeParse(body)

    if (!parsed.success) {
        return Response.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { id, content } = parsed.data

    const { data, error } = await supabase
        .from("files")
        .update({
            content,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("project_id", projectId)

    if (error) {
        return Response.json(
            { error: error.message },
            { status: 500 }
        )
    }

    return Response.json({ success: true })
}