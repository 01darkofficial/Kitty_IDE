import chokidar from "chokidar"
import path from "path"
import { IGNORE_NAMES } from "../filesystem/ignoreFileName"
import { notifyProject } from "../ws/projectSockets"
import { workspaceLogger } from "../utils/logger"

const ROOT = process.env.MAINROOT ?? "/var/lib/cloud-ide/projects"
const API_URL = process.env.API_URL ?? "http://localhost:3000"

export function startFileWatcher(
    projectId: string
) {

    const workspace = path.join(ROOT, projectId)

    workspaceLogger.kittyLog("Starting file watcher: ", projectId, workspace)

    // Separate queues

    const pendingFiles = new Set<string>()
    const pendingFolders = new Set<string>()
    const pendingDeletes = new Set<string>()

    // Separate timers

    let fileCreateTimer: NodeJS.Timeout
    let folderCreateTimer: NodeJS.Timeout
    let deleteTimer: NodeJS.Timeout

    const watcher = chokidar.watch(workspace, {
        ignored: (filePath: string) => {
            const name = path.basename(filePath)
            return IGNORE_NAMES.has(name)
        },
        ignoreInitial: true,
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50
        }
    })

    watcher.on("ready", () => {
        workspaceLogger.kittyDebug("Watcher ready: ", projectId)
    })

    // Watcher error handling (IMPORTANT)

    watcher.on("error", (err) => {
        workspaceLogger.kittyError("File watcher error: ", projectId, err)
    })

    // File created

    watcher.on("add", (filePath) => {

        pendingFiles.add(filePath)
        clearTimeout(fileCreateTimer)

        fileCreateTimer = setTimeout(async () => {
            if (!pendingFiles.size) return

            const paths = Array.from(pendingFiles)
            pendingFiles.clear()

            try {
                await batchCreate(projectId, paths, "file")
            }
            catch (err) {
                workspaceLogger.kittyError("batchCreate execution failed: ", err)
            }
        }, 500)
    })

    // Folder created

    watcher.on("addDir", (dirPath) => {

        pendingFolders.add(dirPath)
        clearTimeout(folderCreateTimer)

        folderCreateTimer = setTimeout(async () => {
            if (!pendingFolders.size) return

            const paths = Array.from(pendingFolders)
            pendingFolders.clear()

            try {
                await batchCreate(projectId, paths, "folder")
            }
            catch (err) {
                workspaceLogger.kittyError("batchCreate execution failed: ", err)
            }
        }, 200)
    })

    // File/Folder Deleted

    watcher.on("unlink", (filePath) => {

        pendingDeletes.add(filePath)
        clearTimeout(deleteTimer)

        deleteTimer = setTimeout(async () => {
            if (!pendingDeletes.size) return

            const paths = Array.from(pendingDeletes)
            pendingDeletes.clear()

            try {
                await batchDelete(projectId, paths)
            }
            catch (err) {
                workspaceLogger.kittyError("batchDelete execution failed: ", err)
            }
        }, 300)
    })

    watcher.on("unlinkDir", (dirPath) => {

        pendingDeletes.add(dirPath)
        clearTimeout(deleteTimer)

        deleteTimer = setTimeout(async () => {
            if (!pendingDeletes.size) return

            const paths = Array.from(pendingDeletes)
            pendingDeletes.clear()

            try {
                await batchDelete(projectId, paths)
            }
            catch (err) {
                workspaceLogger.kittyError("batchDelete execution failed: ", err)
            }
        }, 300)
    })

    return watcher
}


/**
 * Sends batched file/folder creation events
 * to the backend and notifies the frontend.
 *
 * Used to reduce API load by grouping multiple
 * filesystem events into a single request.
 */
async function batchCreate(
    projectId: string,
    paths: string[],
    type: "file" | "folder"
) {

    if (!paths.length) return

    try {
        const workspace = path.join(ROOT, projectId)

        const entries = paths.map(fullPath => {
            const relative = path.relative(workspace, fullPath)
            return {
                relative,
                type
            }
        })

        workspaceLogger.kittyDebug("Creating entries: ", entries.length)

        const res = await fetch(`${API_URL}/api/internal/files/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                projectId,
                entries
            })
        })

        if (!res.ok) {
            workspaceLogger.kittyError("File create API failed: ", res.status)
            return
        }

        let data

        try {
            data = await res.json()
        }
        catch (err) {
            workspaceLogger.kittyError("Invalid JSON response from create API: ", err)
            return
        }

        notifyProject(projectId, {
            type: "nodes_created",
            nodes: data.nodes
        })
    }

    catch (err) {
        workspaceLogger.kittyError("batchCreate failed: ", err)
    }
}

/**
 * Sends batched file/folder deletion events
 * to the backend and notifies the frontend.
 *
 * Triggered when files or directories are removed.
 */
async function batchDelete(
    projectId: string,
    paths: string[]
) {

    if (!paths.length) return

    try {
        workspaceLogger.kittyDebug("Deleting entries: ", paths.length)

        const res = await fetch(`${API_URL}/api/internal/files/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                projectId,
                paths
            })
        })

        if (!res.ok) {
            workspaceLogger.kittyError("File delete API failed: ", res.status)
            return
        }

        let data

        try {
            data = await res.json()
        }
        catch (err) {
            workspaceLogger.kittyError("Invalid JSON response from create API: ", err)
            return
        }

        notifyProject(projectId, {
            type: "nodes_deleted",
            nodes: data.nodes
        })
    }

    catch (err) {
        workspaceLogger.kittyError("batchDelete failed: ", err)
    }
}