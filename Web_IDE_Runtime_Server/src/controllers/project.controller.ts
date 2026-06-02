import { Request, Response, } from "express"
import { createWorkspaceService, importWorkspaceService, deleteProjectService } from "../services/project.service"
import { projectLogger } from "../utils/logger"
import { UploadedFile } from "../types/upload"

/**
Handles project creation requests.
*/
export async function createWorkspaceController(
    req: Request,
    res: Response
) {
    try {
        const { projectId } = req.body

        if (!projectId) {
            return res.status(400).json({ error: "projectId required" })
        }

        const result = await createWorkspaceService(projectId)
        return res.json(result)
    }
    catch (err) {
        projectLogger.kittyError("Workspace creation failed: ", err)
        return res.status(500).json({ error: "Workspace creation failed" })
    }

}

/**
Handles project import requests.
*/
export async function importWorkspaceController(
    req: Request,
    res: Response
) {
    try {
        const { projectId } = req.body
        const files = req.files as UploadedFile[]

        if (!projectId) {
            return res.status(400).json({ error: "projectId required" })
        }

        if (!files?.length) {
            return res.status(400).json({ error: "Import requires ZIP" })
        }

        const result = await importWorkspaceService(projectId, files)
        return res.json(result)
    }
    catch (err) {
        projectLogger.kittyError("Workspace import failed: ", err)
        return res.status(500).json({ error: "Workspace import failed" })
    }
}

/**
Handles project deletion requests.
*/
export async function deleteProjectController(
    req: Request,
    res: Response
) {
    try {
        const { projectId } = req.body

        if (!projectId) {
            return res.status(400).json({ error: "projectId required" })
        }

        const result = await deleteProjectService(projectId)
        return res.json(result)
    }
    catch (err) {
        projectLogger.kittyError("Project delete failed: ", err)
        return res.status(500).json({ error: "Project deletion failed" })
    }
}