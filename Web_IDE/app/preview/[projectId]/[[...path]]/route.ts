import { NextRequest } from "next/server"
import { getPreviewFiles } from "@/lib/preview/cache"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string, path?: string[] }> }) {
    const { projectId, path } = await params

    const files = getPreviewFiles(projectId)
    if (!files) {
        return new Response("Preview not loaded", { status: 404 })
    }

    const requestedPath = path?.join("/") || "index.html"
    const file = files[requestedPath]

    if (!file) {
        return new Response("File not found", { status: 404 })
    }

    return new Response(file.content, {
        headers: {
            "Content-Type": file.mimeType,
            "Cache-Control": "no-cache",
        },
    })
}