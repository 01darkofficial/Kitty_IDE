import { createClient } from "@supabase/supabase-js"
import { createServerSupabase } from "@/lib/supabase/supabaseServer"

export const runtime = "nodejs"

export async function GET() {
    const supabase = await createServerSupabase()
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    return Response.json({ user })
}

export async function DELETE() {
    const supabase = await createServerSupabase()
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Account deletion is not configured: missing Supabase server environment variables.")
        return Response.json(
            { error: "Account deletion is temporarily unavailable. Please try again later." },
            { status: 503 },
        )
    }

    // This client must remain server-only. Never expose the service-role key to the browser.
    const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })

    const { error: deletionError } = await admin.auth.admin.deleteUser(user.id)

    if (deletionError) {
        console.error("Supabase account deletion failed:", deletionError.message)
        return Response.json(
            { error: "Could not delete your account. Please try again later." },
            { status: 500 },
        )
    }

    return new Response(null, { status: 204 })
}
