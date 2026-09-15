import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextRequest } from "next/server"

const RUNTIME_API_URL = process.env.RUNTIME_SERVER_URL!

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const { projectId } = await params
    const supabase = supabaseAdmin

    // Verify project runtime
    const { data: project } = await supabase
        .from("projects")
        .select("runtime")
        .eq("id", projectId)
        .single()

    if (!project) {
        return new Response("Project not found", { status: 404 })
    }

    if (project.runtime !== "static") {
        return new Response("Preview only supported for static projects", {
            status: 400,
        })
    }

    // Metadata tree
    const { data: allFiles, error } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", projectId)

    if (error) {
        return new Response(error.message, { status: 500 })
    }

    // Reading every file from runtime Server
    const runtimeRes = await fetch(`${RUNTIME_API_URL}/files/read-all`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            projectId,
            allFiles,
        }),
    })

    if (!runtimeRes.ok) {
        return new Response("Failed to load preview files", { status: 500 })
    }

    const data = await runtimeRes.json()

    return Response.json(data)
}