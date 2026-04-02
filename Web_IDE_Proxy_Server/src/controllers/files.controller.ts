import { Request, Response } from "express"
import { createFileService, deleteFileService, listFiles, readFileService, updateFileService } from "../services/files.service"

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
        const { projectId, file, allFiles, content } = req.body

        console.log("updating file: ", file, content)
        if (!projectId) {
            return res.status(400).json({
                error:
                    "projectId required"
            })
        }

        await updateFileService(projectId, file, allFiles, content)

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
        const { projectId, file, allFiles } = req.body

        const result = await readFileService(projectId, file, allFiles)
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
        const { projectId, files, allFiles } = req.body

        if (!projectId || !files) {
            return res.status(400).json({
                error: "Invalid payload"
            })
        }

        /*
        STEP 1 — Build fileMap ONCE
        */

        const fileMap = new Map<string, any>()

        for (const f of allFiles) {
            fileMap.set(f.id, f)

        }

        /*
        STEP 2 — Filter root targets
        (avoid redundant deletes)
        */

        const idSet = new Set(files.map((f: any) => f.id))

        const rootTargets = files.filter((file: any) => {
            if (!file.parent_id) return true

            return !idSet.has(file.parent_id)
        })

        /*
        STEP 3 — Delete only root nodes
        */

        for (const file of rootTargets) {
            await deleteFileService(projectId, file, fileMap)
        }

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