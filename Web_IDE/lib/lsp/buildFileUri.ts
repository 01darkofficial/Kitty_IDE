import { FileNode } from "@/types/db"

const WORKSPACE_ROOT = "/var/lib/cloud-ide/projects"

/**
 * Builds a file URI from the project's workspace path and file hierarchy.
 */
export function buildFileUri(
    projectId: string,
    fileId: string,
    files: FileNode[],
) {

    const map = new Map(files.map((f) => [f.id, f]))
    const parts: string[] = []
    let current = map.get(fileId)

    while (current) {
        parts.unshift(current.name)
        current = current.parent_id ? map.get(current.parent_id) : undefined
    }

    return `file://${WORKSPACE_ROOT}/${projectId}/${parts.join("/")}`
}