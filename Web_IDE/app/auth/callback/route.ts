import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/supabaseServer"

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
        return NextResponse.redirect(
            `${origin}/login?error=oauth_callback_failed`
        )
    }

    const supabase = await createServerSupabase()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        return NextResponse.redirect(
            `${origin}/login?error=oauth_callback_failed`
        )
    }

    return NextResponse.redirect(`${origin}/app`)
}