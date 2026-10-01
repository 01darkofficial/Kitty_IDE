import { FileNode } from "@/types/db"

/**
 * Builds the workspace-relative path for a file or folder.
 */
export function buildRelativePath(
    fileId: string,
    files: FileNode[],
): string {
    const map = new Map(files.map((f) => [f.id, f]))
    const parts = []
    let current = map.get(fileId)

    while (current) {
        parts.unshift(current.name)
        current = current.parent_id ? map.get(current.parent_id) : undefined
    }

    return parts.join("/")
}