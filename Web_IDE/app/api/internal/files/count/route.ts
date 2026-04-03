import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(
    req: Request
) {

    const url =
        new URL(req.url)

    const projectId =
        url.searchParams.get("projectId")

    const supabase = supabaseAdmin

    const { count } =
        await supabase
            .from("files")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("project_id", projectId)

    return Response.json({
        count
    })

}