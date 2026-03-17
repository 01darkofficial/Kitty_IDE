import { createServerSupabase } from "@/lib/supabase/supabaseServer"


export async function getUser() {
    const supabase = await createServerSupabase();

    const {
        data: { user }, error
    } = await supabase.auth.getUser();

    if (error) {
        throw new Error(error.message);
    }

    return user;
}

export async function getProfile(userId: string) {
    const supabase = await createServerSupabase();

    const { data: profile, error } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .eq("id", userId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return profile;
}