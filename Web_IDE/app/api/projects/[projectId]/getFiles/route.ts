import { createServerSupabase } from "@/lib/supabase/supabaseServer"

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {

    const { projectId } = await params

    const supabase = await createServerSupabase()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch only metadata needed for the tree
    const { data, error } = await supabase
        .from("files")
        .select("id, parent_id, name, type")
        .eq("project_id", projectId)
        .order("type", { ascending: false }) // folders first (optional)
        .order("name", { ascending: true })

    if (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ files: data ?? [] })
}