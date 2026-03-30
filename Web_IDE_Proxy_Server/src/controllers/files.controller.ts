import { Request, Response } from "express"
import { listFiles } from "../services/files.service"

export async function getFilesController(
    req: Request,
    res: Response
) {

    const projectId = req.query.projectId as string

    if (!projectId) {
        return res
            .status(400)
            .json({ error: "projectId required" })
    }

    try {

        const files = await listFiles(projectId)

        res.json({ files })

    } catch (err) {

        console.error("FILES ERROR:", err)

        res
            .status(500)
            .json({ error: "failed to read files" })

    }
}