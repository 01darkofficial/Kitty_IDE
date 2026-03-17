import { createServerSupabase } from "@/lib/supabase/supabaseServer"
import { createNodeSchema } from "@/lib/validation/file"

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

    const parsed = createNodeSchema.safeParse(body)

    if (!parsed.success) {
        return Response.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { name, type, parent_id, content } = parsed.data

    const { data, error } = await supabase
        .from("files")
        .insert({
            name,
            type,
            project_id: projectId,
            parent_id: parent_id ?? null,
            content: type === "file" ? content ?? "" : "",
        })
        .select()
        .single()

    if (error) {
        return Response.json(
            { error: error.message },
            { status: 500 }
        )
    }

    return Response.json(data)
}