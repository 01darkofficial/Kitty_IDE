import { NextRequest } from "next/server"
import { setPreviewFiles, updatePreviewFile } from "@/lib/preview/cache"

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params
    const { files } = await req.json()

    // Updating all files in the server cache
    setPreviewFiles(projectId, files)

    return Response.json({ success: true })
}


export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const { projectId } = await params

    const { fileId, content } = await req.json()

    updatePreviewFile(projectId, fileId, content)

    return Response.json({ success: true })
}