import fs from "fs/promises"
import path from "path"
import { getDbCount, getValidDiskCount } from "./fileCountValidation"
import { notifyProject } from "../ws/projectSockets"
import { workspaceLogger } from "../utils/logger"

const ROOT = process.env.MAINROOT ?? "/var/lib/cloud-ide/projects"
const API_URL = process.env.API_URL ?? "http://localhost:3000"

/**
 * Performs initial filesystem scan and registers
 * workspace files in the backend database.
 */
export async function initialWorkspaceScan(
    projectId: string
) {

    const workspace = path.join(ROOT, projectId)

    workspaceLogger.kittyLog("Initial workspace scan:", workspace)


    const entriesToCreate: {
        relative: string
        type: "file" | "folder"
    }[] = []

    /**
     * Recursively walks workspace directory.
     */
    async function walk(dir: string) {

        let entries

        try {
            entries = await fs.readdir(dir, { withFileTypes: true })
        }

        catch (err) {
            workspaceLogger.kittyError("Directory read failed: ", dir, err)
            return
        }

        for (const entry of entries) {

            // Ignore heavy folders
            if (
                entry.name === "node_modules" ||
                entry.name === ".git" ||
                entry.name === ".pnpm"
            ) continue

            const fullPath = path.join(dir, entry.name)
            const relative = path.relative(workspace, fullPath)
            const type = entry.isDirectory() ? "folder" : "file"

            entriesToCreate.push({ relative, type })

            if (entry.isDirectory()) {
                await walk(fullPath)
            }
        }
    }

    await walk(workspace)

    workspaceLogger.kittyDebug("Entries collected:", entriesToCreate.length)


    // Send batch request
    try {

        const res = await fetch(`${API_URL}/api/internal/files/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                projectId,
                entries: entriesToCreate
            })
        })

        if (!res.ok) {
            workspaceLogger.kittyError("File create API failed: ", res.status)
            return
        }

        const data = await res.json()

        workspaceLogger.kittyLog("Workspace nodes created: ", data.nodes?.length ?? 0)

        notifyProject(projectId, {
            type: "nodes_created",
            entries: data.nodes
        })
    }

    catch (err) {
        workspaceLogger.kittyError("Initial workspace scan failed: ", err)
    }
}

/**
 * Determines whether initial workspace scan is required.
 */
export async function shouldRunInitialScan(
    projectId: string
): Promise<boolean> {

    try {

        const workspace = path.join(ROOT, projectId)

        const [dbCount, diskCount] = await Promise.all([
            getDbCount(projectId),
            getValidDiskCount(workspace)
        ])

        workspaceLogger.kittyDebug(
            "Scan check:",
            projectId,
            "db:",
            dbCount,
            "disk:",
            diskCount
        )

        // Workspace missing
        if (diskCount === -1) return true

        // Disk has files but DB empty
        if (diskCount > 0 && dbCount === 0) return true

        // DB has files but disk empty
        if (diskCount === 0 && dbCount > 0) return true

        return false
    }

    catch (err) {
        workspaceLogger.kittyError("shouldRunInitialScan failed: ", err)
        return false
    }
}