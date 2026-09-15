import { Request, Response } from "express"
import { createFileService, deleteFileService, listFiles, readAllFilesService, readFileService, updateFileService } from "../services/files.service"

export async function getFilesController(req: Request, res: Response) {
    const projectId = req.query.projectId as string

    if (!projectId) {
        return res.status(400).json({ error: "projectId required" })
    }

    try {
        const files = await listFiles(projectId)
        res.json({ files })
    } catch (err) {
        console.error("FILES ERROR:", err)
        res.status(500).json({ error: "failed to read files" })
    }
}

export async function createFileController(req: Request, res: Response) {
    try {
        console.log("Creating file on disk:", req.body.file?.name)

        const { projectId, file, allFiles } = req.body

        if (!projectId) {
            return res.status(400).json({
                error: "projectId required"
            })
        }

        const result = await createFileService(projectId, file, allFiles)
        res.json(result)

    } catch (err) {

        console.error("CREATE FILE/FOLDER ERROR:", err)
        res.status(500).json({
            error: "failed to create file/folder"
        })

    }

}

export async function updateFileController(req: Request, res: Response) {
    try {
        const { projectId, fileId, allFiles, content } = req.body

        if (!projectId) {
            return res.status(400).json({
                error: "projectId required"
            })
        }

        await updateFileService(projectId, fileId, allFiles, content)

        res.json({
            success: true
        })
    } catch (err) {
        console.error("UPDATE FILE ERROR:", err)
        res.status(500).json({
            error: "failed to update file"
        })
    }
}

export async function readFileController(req: Request, res: Response
) {
    try {
        const { projectId, fileId, allFiles } = req.body

        const result = await readFileService(projectId, fileId, allFiles)
        res.json(result)
    } catch (err) {
        console.error("READ FILE ERROR:", err
        )
        res.status(500).json({
            error: "failed to read file"
        })
    }
}

export async function readAllFilesController(req: Request, res: Response
) {
    try {
        const { projectId, allFiles } = req.body

        const result = await readAllFilesService(projectId, allFiles)
        res.json(result)
    } catch (err) {
        console.error("READ FILE ERROR:", err
        )
        res.status(500).json({
            error: "failed to read file"
        })
    }
}

export async function deleteFileController(req: Request, res: Response) {
    try {
        const { projectId, fileIds, allFiles } = req.body

        if (!projectId || !fileIds) {
            return res.status(400).json({
                error: "Invalid payload"
            })
        }

        await deleteFileService(projectId, fileIds, allFiles)

        res.json({
            success: true
        })

    } catch (err) {
        console.error("DELETE FILE ERROR:", err)

        res.status(500).json({
            error: "failed to delete file"
        })
    }
}