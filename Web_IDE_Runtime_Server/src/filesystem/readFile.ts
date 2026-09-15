import fs from "fs/promises"
import { buildFileMap, resolveSafePath } from "./pathUtils"
import { FileNode } from "../types/db"
import { PreviewFile } from "../types/file"

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
    map: "application/json",
}

function getMimeType(path: string) {
    const ext = path.split(".").pop()?.toLowerCase() || ""
    return MIME_TYPES[ext] || "text/plain"
}

export async function readFileFromDisk(
    projectId: string,
    fileId: string,
    allFiles: FileNode[]
) {

    const fileMap = buildFileMap(allFiles)
    const file = fileMap.get(fileId)

    if (!file) {
        throw new Error("File not found")
    }

    const { safePath } = resolveSafePath(projectId, file, fileMap)
    const content = await fs.readFile(safePath, "utf-8")

    return content

}
export async function readAllFilesFromDisk(
    projectId: string,
    allFiles: FileNode[]
) {
    const fileMap = buildFileMap(allFiles)

    const previewFiles: Record<string, PreviewFile> = {}

    for (const file of allFiles) {

        if (file.type !== "file") continue

        const { safePath, relativePath } = resolveSafePath(
            projectId,
            file,
            fileMap
        )

        const content = await fs.readFile(safePath, "utf-8")

        previewFiles[relativePath] = {
            id: file.id,
            content,
            mimeType: getMimeType(relativePath),
        }
    }

    return previewFiles
}