import fs from "fs/promises"
import path from "path"
import { FileNode } from "../types/db"
import { workspaceLogger } from "../utils/logger"

/**
 * Materializes project files into a workspace directory.
 *
 * Behavior:
 * - Creates workspace if missing
 * - Skips materialization if workspace already populated
 * - Reconstructs file tree from FileNode list
 *
 * Returns absolute workspace path.
 */
export async function materializeProject(
    projectId: string,
    files: FileNode[]
): Promise<string> {

    const workspace = `/var/lib/cloud-ide/projects/${projectId}`

    /*
    Path safety guard
    */

    if (!workspace.startsWith("/var/lib/cloud-ide/projects/")) {
        workspaceLogger.kittyError("Workspace path validation failed: ", { projectId, workspace })
        throw new Error("Invalid workspace path")
    }

    /*
    Ensure workspace directory exists
    */

    await fs.mkdir(workspace, { recursive: true })

    /*
    Detect existing workspace content
    */

    const entries = await fs.readdir(workspace)
    const isEmpty = entries.length === 0

    /*
    Skip rebuild if workspace populated
    */

    if (!isEmpty) {
        workspaceLogger.kittyLog("Workspace reuse: ", { projectId })
        return workspace
    }

    workspaceLogger.kittyLog("Materializing workspace: ", { projectId, fileCount: files.length })

    /*
    Build file lookup map
    */

    const fileMap = new Map<string, FileNode>()

    for (const f of files) {
        fileMap.set(f.id, f)
    }

    /*
    Resolve nested file path
    */

    function buildPath(file: FileNode) {

        const parts = [file.name]
        let parent = file.parent_id

        while (parent) {

            const p = fileMap.get(parent)

            if (!p) break

            parts.unshift(p.name)
            parent = p.parent_id
        }
        return parts.join("/")
    }

    /*
    Write file tree
    */

    for (const file of files) {

        if (file.type !== "file") continue

        const relativePath = buildPath(file)
        const fullPath = path.join(workspace, relativePath)

        await fs.mkdir(path.dirname(fullPath), { recursive: true })
        await fs.writeFile(fullPath, file.content || "")
    }

    workspaceLogger.kittyDebug("Workspace materialized: ", { projectId })

    return workspace
}