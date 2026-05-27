import JSZip from "jszip"
import { WorkspaceFileNode } from "@/types/db"
import { shouldIgnorePath } from "./shouldIgnorePath"
import { importLogger } from "@/utils/logger"
import path from "path"

/**
Extracts a ZIP import into workspace file nodes.

Includes validation against:
- path traversal
- symlinks
- oversized archives
*/
export async function extractImportZip(
    projectId: string,
    file: File
): Promise<WorkspaceFileNode[]> {

    importLogger.kittyLog("Extracting ZIP", {
        projectId,
        filename: file.name
    })

    const MAX_FILES = 10000
    const MAX_TOTAL_SIZE = 1024 * 1024 * 500   // 500MB

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const zip = await JSZip.loadAsync(buffer)
    const files: WorkspaceFileNode[] = []
    const now = new Date().toISOString()

    const folderMap = new Map<string, string>()

    const entries = Object.entries(zip.files)

    // ZIP bomb protection

    if (entries.length > MAX_FILES) {
        throw new Error("Too many files in ZIP")
    }

    let totalSize = 0

    for (const [zipPath, entry] of entries) {

        // Ignore blocked paths
        if (shouldIgnorePath(zipPath)) {
            continue
        }

        // Normalize path
        const normalized = zipPath.replace(/\\/g, "/").replace(/\/$/, "")

        if (!normalized) {
            continue
        }

        // Path traversal protection
        const safePath = path.posix.normalize(normalized)

        if (safePath.startsWith("../")) {
            throw new Error(`Invalid path: ${zipPath}`)
        }

        const parts = safePath.split("/")
        let currentPath = ""
        let parentId = null

        // Build folder tree

        for (let i = 0; i < parts.length - 1; i++) {

            const folderName = parts[i]
            currentPath += `${folderName}/`

            if (!folderMap.has(currentPath)) {

                const folderId = crypto.randomUUID()

                folderMap.set(currentPath, folderId)
                files.push({
                    id: folderId,
                    project_id: projectId,
                    parent_id: parentId,
                    name: folderName,
                    type: "folder",
                    content: null,
                    created_at: now,
                    updated_at: now,
                })
            }

            parentId = folderMap.get(currentPath)!
        }

        if (entry.dir) {
            continue
        }

        const unixPerm = entry.unixPermissions
        const isSymlink = typeof unixPerm === "number" && (unixPerm & 0o170000) === 0o120000

        if (isSymlink) {
            throw new Error(`Symlink not allowed: ${zipPath}`)
        }

        const content = await entry.async("nodebuffer")
        totalSize += content.length

        if (totalSize > MAX_TOTAL_SIZE) {
            throw new Error("ZIP exceeds maximum allowed size")
        }

        const fileName = parts[parts.length - 1]

        files.push({
            id: crypto.randomUUID(),
            project_id: projectId,
            parent_id: parentId,
            name: fileName,
            type: "file",
            content: content,
            created_at: now,
            updated_at: now,
        })
    }

    importLogger.kittyLog("ZIP extracted: ", {
        projectId,
        fileCount: files.length,
        totalSize,
    })

    return files
}