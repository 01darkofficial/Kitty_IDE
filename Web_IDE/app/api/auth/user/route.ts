import { createServerSupabase } from "@/lib/supabase/supabaseServer"

export async function GET() {
    const supabase = await createServerSupabase()

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("users")
        .select("username")
        .eq("id", user!.id)
        .single()

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    return Response.json({ user })
}