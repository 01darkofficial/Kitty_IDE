import fs from "fs/promises"
import path from "path"
import JSZip from "jszip"
import docker from "../runtime/docker"
import { runtimeMap, previewReadyMap } from "../runtime/runtimeMap"
import { lastUsedMap } from "../runtime/activity"
import { projectLogger } from "../utils/logger"
import { UploadedFile } from "../types/upload"
import { IGNORE_NAMES } from "../filesystem/ignoreFileName"
import { initialWorkspaceScan } from "../runtime/initialWorkspaceScan"
import { env } from "../config/env";

const WORKSPACE_ROOT = env.MAINROOT;
const MAX_FILES = 10000
const MAX_TOTAL_SIZE = 1024 * 1024 * 500    // 500MB

export async function createWorkspaceService(
    projectId: string
) {
    const workspace = path.resolve(WORKSPACE_ROOT, projectId)

    if (!workspace.startsWith(WORKSPACE_ROOT + path.sep)) {
        throw new Error("Invalid workspace path")
    }

    await fs.mkdir(workspace, { recursive: true })
    projectLogger.kittyLog("Workspace created: ", { projectId })

    return { success: true }
}

/*
Creates a project workspace.

ZIP imports include validation against
path traversal, symlinks, and oversized archives.
*/
export async function importWorkspaceService(
    projectId: string,
    files: UploadedFile[]) {

    const workspace = path.resolve(WORKSPACE_ROOT, projectId)

    if (!workspace.startsWith(WORKSPACE_ROOT + path.sep)) {
        throw new Error("Invalid workspace path")
    }

    await fs.mkdir(workspace, { recursive: true })

    projectLogger.kittyLog("Workspace created: ", { projectId })
    const zipFile = files?.[0]

    if (!zipFile) {
        throw new Error("Import ZIP missing")
    }

    projectLogger.kittyLog("Extracting import ZIP: ", {
        projectId,
        filename: zipFile.originalname,
    })

    const zip = await JSZip.loadAsync(zipFile.buffer)
    const entries = Object.entries(zip.files)

    /*
    Strip common wrapper folders so files
    extract directly into the workspace.
    */
    const normalizedEntries = entries.map(([zipPath]) => zipPath.replace(/\\/g, "/").replace(/\/$/, "")).filter(Boolean)
    let rootFolder = ""
    const firstEntry = normalizedEntries[0]

    if (firstEntry) {
        const candidate = firstEntry.split("/")[0]
        const allShareSameRoot = normalizedEntries.every((entry) =>
            entry === candidate || entry.startsWith(candidate + "/")
        )

        if (allShareSameRoot && normalizedEntries.length > 1) {
            rootFolder = candidate + "/"
        }
    }

    if (entries.length > MAX_FILES) {
        throw new Error("Too many files in ZIP")
    }

    let totalSize = 0

    for (const [zipPath, entry] of entries) {
        let normalized = zipPath.replace(/\\/g, "/").replace(/\/$/, "")

        if (rootFolder && (normalized === rootFolder.slice(0, -1) || normalized.startsWith(rootFolder))) {
            normalized = normalized.slice(rootFolder.length)
        }

        if (!normalized) {
            continue
        }

        const segments = normalized.split("/")
        const shouldSkip = segments.some((segment) => IGNORE_NAMES.has(segment))

        if (shouldSkip) {
            continue
        }

        const fullPath = path.resolve(workspace, normalized)

        /*
        Prevent ZIP path traversal attacks.
        */
        if (!fullPath.startsWith(workspace + path.sep)) {
            throw new Error(`Invalid path:  ${zipPath}`)
        }

        if (entry.dir) {
            await fs.mkdir(fullPath, { recursive: true, })
            continue
        }

        /*
        Reject symbolic links to avoid writes
        outside the workspace boundary.
        */
        const unixPerm = entry.unixPermissions
        const isSymlink = isZipSymlink(unixPerm)

        if (isSymlink) {
            throw new Error(`Symlink not allowed: ${zipPath}`)
        }

        const content = await entry.async("nodebuffer")
        totalSize += content.length

        if (totalSize > MAX_TOTAL_SIZE) {
            throw new Error("ZIP exceeds maximum allowed size")
        }

        await fs.mkdir(path.dirname(fullPath), { recursive: true, })
        await fs.writeFile(fullPath, content)
    }

    projectLogger.kittyLog("ZIP extracted: ", {
        projectId,
        totalSize,
        fileCount: entries.length,
    })

    await initialWorkspaceScan(projectId)


    return { success: true }
}

/**
Destroys the project runtime and workspace.
*/
export async function deleteProjectService(
    projectId: string
) {
    const containerName = `project-${projectId}`

    projectLogger.kittyLog("Deleting project runtime: ", projectId)

    /*
    Remove container before deleting workspace
    to avoid active mount/file usage conflicts.
    */
    try {
        const container = docker.getContainer(containerName)

        try {
            const info = await container.inspect()

            if (info.State.Running) {
                projectLogger.kittyLog("Stopping container: ", containerName)
                await container.stop()
            }

            projectLogger.kittyLog("Removing container: ", containerName)
            await container.remove({ force: true })

        }
        catch (err: any) {
            if (err.statusCode !== 404) {
                throw err
            }
            projectLogger.kittyWarn("Container not found: ", containerName)
        }
    }
    catch (err) {
        projectLogger.kittyError("Container removal failed: ", err)
        throw err
    }

    const workspace = `/var/lib/cloud-ide/projects/${projectId}`

    try {
        projectLogger.kittyLog("Deleting workspace: ", workspace)
        await fs.rm(workspace, { recursive: true, force: true })
    }
    catch (err) {
        projectLogger.kittyError("Workspace removal failed: ", err)
        throw err
    }

    runtimeMap.delete(projectId)
    previewReadyMap.delete(projectId)
    lastUsedMap.delete(projectId)

    projectLogger.kittyLog("Runtime memory cleared: ", projectId)

    return { success: true }
}

/**
Reject symlink ZIP entries to prevent
workspace escape during extraction.
*/
function isZipSymlink(unixPerm?: unknown) {

    if (typeof unixPerm !== "number") {
        return false
    }

    const FILE_TYPE_MASK = 0o170000
    const SYMBOLIC_LINK = 0o120000

    return ((unixPerm & FILE_TYPE_MASK) === SYMBOLIC_LINK)
}