import path from "path"
import { FileNode } from "../types/db"

const ROOT = process.env.MAINROOT ?? "/var/lib/cloud-ide/projects"

export function buildFileMap(files: FileNode[]): Map<string, FileNode> {
    const map = new Map<string, FileNode>()
    for (const f of files) {
        map.set(f.id, f)
    }
    return map
}

export function buildRelativePath(node: FileNode, fileMap: Map<string, FileNode>): string {
    const parts = [node.name]
    let parent = node.parent_id

    while (parent) {
        const p = fileMap.get(parent)
        if (!p) break
        parts.unshift(p.name)
        parent = p.parent_id
    }

    return parts.join("/")
}



export function resolveSafePath(
    projectId: string,
    file: FileNode,
    fileMap: Map<string, FileNode>
) {

    const workspace = path.join(ROOT, projectId)
    const relativePath = buildRelativePath(file, fileMap)
    const fullPath = path.join(workspace, relativePath)
    const safePath = path.normalize(fullPath)

    if (!safePath.startsWith(workspace)) {
        throw new Error("Invalid path detected")
    }

    return { workspace, relativePath, safePath }

}