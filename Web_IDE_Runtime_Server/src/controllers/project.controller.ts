import { Request, Response, } from "express"
import { deleteProjectService, createProjectService, } from "../services/project.service"
import { projectLogger } from "../utils/logger"
import { UploadedFile } from "../types/upload"

/**
Handles project creation requests.
Validates input before delegating to the service layer.
*/
export async function createProjectController(
    req: Request,
    res: Response
) {
    try {
        const { projectId, source } = req.body
        const files = req.files as UploadedFile[]

        if (!projectId) {
            return res.status(400).json({ error: "projectId required" })
        }

        if (!source) {
            return res.status(400).json({ error: "source required" })
        }

        /*
        import validation
        */

        if (source === "import" && (!files || !files.length)) {
            return res.status(400).json({ error: "Import requires files" })
        }

        projectLogger.kittyLog("Creating project workspace: ", {
            projectId,
            source,
        })

        const result = await createProjectService({ projectId, source, files })

        return res.json(result)
    }
    catch (err) {
        projectLogger.kittyError("Project creation failed: ", err)
        return res.status(500).json({ error: "Project creation failed" })
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