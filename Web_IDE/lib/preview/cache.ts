import { PreviewFile } from "@/types/editor"

const previewCache = new Map<string, Record<string, PreviewFile>>()

export function setPreviewFiles(
    projectId: string,
    files: Record<string, PreviewFile>
) {
    previewCache.set(projectId, files)
}

export function getPreviewFiles(projectId: string) {
    return previewCache.get(projectId)
}

export function updatePreviewFile(
    projectId: string,
    fileId: string,
    content: string
) {
    const files = previewCache.get(projectId)
    if (!files) return

    for (const file of Object.values(files)) {
        if (file.id === fileId) {
            file.content = content
            break
        }
    }
}