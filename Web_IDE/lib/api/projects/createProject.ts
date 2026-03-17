import { supabase } from "@/lib/supabase/supabaseClient"

export async function createProject(name: string) {

    const {
        data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
        throw new Error("Not authenticated")
    }

    const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ name })
    })

    const data = await res.json()

    if (data.error) {
        throw new Error(data.error)
    }

    return data.project
}