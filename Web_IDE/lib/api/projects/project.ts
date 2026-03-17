import { createServerSupabase } from "@/lib/supabase/supabaseServer";
import { validate as isUuid } from "uuid";
import { FileNode } from "@/types/db";

export async function getProjects(userId: string) {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function getProject(projectId: string) {
    const supabase = await createServerSupabase()

    if (!isUuid(projectId)) {
        throw new Error("Invalid project id")
    }

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function getProjectFiles(projectId: string): Promise<FileNode[]> {
    const supabase = await createServerSupabase()

    if (!isUuid(projectId)) {
        throw new Error("Invalid project id")
    }

    const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", projectId)

    if (error) {
        throw new Error(error.message)
    }

    return data ?? []
}