import fs from "fs/promises"
import { IGNORE_NAMES } from "../filesystem/ignoreFileName"
import { workspaceLogger } from "../utils/logger"

const API_URL = process.env.API_URL ?? "http://localhost:3000"

/**
 * Counts valid filesystem entries in workspace.
 *
 * Returns:
 * number → valid file/folder count
 * -1     → workspace missing
 */
export async function getValidDiskCount(
    workspace: string
): Promise<number> {

    try {

        const entries = await fs.readdir(workspace, { withFileTypes: true })

        let count = 0

        for (const entry of entries) {
            if (IGNORE_NAMES.has(entry.name)) continue
            count++
        }

        return count
    }

    catch {
        // Workspace missing or unreadable
        workspaceLogger.kittyDebug("Workspace not found: ", workspace)
        return -1
    }
}

/**
 * Fetches file count from database API.
 */
export async function getDbCount(
    projectId: string
): Promise<number> {

    try {

        const res = await fetch(`${API_URL}/api/internal/files/count?projectId=${projectId}`)

        if (!res.ok) {
            workspaceLogger.kittyError(
                "DB count API failed:",
                projectId,
                res.status
            )
            return 0
        }

        let data

        try {
            data = await res.json()
        }

        catch (err) {
            workspaceLogger.kittyError("Invalid JSON from DB count API: ", err)
            return 0
        }

        return Number(data.count) || 0
    }

    catch (err) {
        workspaceLogger.kittyError(
            "getDbCount request failed:",
            projectId,
            err
        )
        return 0
    }
}