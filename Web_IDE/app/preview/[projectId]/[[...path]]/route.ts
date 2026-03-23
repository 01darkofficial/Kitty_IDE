import { NextRequest } from "next/server"
import { SupabaseClient } from "@supabase/supabase-js"

import { FileNode } from "@/types/db"
import { supabaseAdmin } from "@/lib/supabase/admin"

const MIME_TYPES: Record<string, string> = {
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    txt: "text/plain",
    wasm: "application/wasm",
    map: "application/json"
}

function getMimeType(path: string) {
    const ext = path.split(".").pop()?.toLowerCase() || ""
    return MIME_TYPES[ext] || "text/plain"
}

export async function resolveFile(
    supabase: SupabaseClient,
    projectId: string,
    path: string
): Promise<FileNode | null> {

    const parts = path.split("/")

    let parent: string | null = null
    let node: FileNode | null = null

    for (const part of parts) {

        let query = supabase
            .from("files")
            .select("*")
            .eq("project_id", projectId)
            .eq("name", part)

        if (parent === null) {
            query = query.is("parent_id", null)
        } else {
            query = query.eq("parent_id", parent)
        }

        const { data } = await query.maybeSingle() as {
            data: FileNode | null
        }

        if (!data) return null

        node = data
        parent = data.id
    }

    return node
}

export async function GET(
    req: NextRequest,
    { params }: {
        params: Promise<{
            projectId: string
            path?: string[]
        }>
    }
) {

    const supabase = supabaseAdmin

    const { projectId, path } = await params

    console.log("PREVIEW ROUTE HIT", projectId, path)

    let filePath = path?.join("/") || "index.html"

    if (filePath === "") {
        filePath = "index.html"
    }

    if (filePath.includes("..")) {
        return new Response("Invalid path", { status: 400 })
    }

    /*
      STEP 1
      Detect runtime directly
    */

    const { data: project } = await supabase
        .from("projects")
        .select("runtime")
        .eq("id", projectId)
        .single()

    if (!project) {
        return new Response(
            "Project not found",
            { status: 404 }
        )
    }

    const runtime = project.runtime

    /*
      STEP 2
      Node runtime → proxy to container
    */

    if (runtime === "node") {

        const url =
            `http://${projectId}.preview.localhost:4000${req.nextUrl.search}`

        return Response.redirect(url)
    }

    /*
      STEP 3
      Static runtime → serve files from DB
    */

    const file = await resolveFile(
        supabase,
        projectId,
        filePath
    )

    if (!file || file.type !== "file") {
        return new Response(
            "File not found",
            { status: 404 }
        )
    }

    return new Response(file.content || "", {
        status: 200,
        headers: {
            "Content-Type": getMimeType(filePath),
            "Cache-Control": "no-cache"
        }
    })
}