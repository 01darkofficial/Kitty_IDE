import { Request, Response } from "express"
import { pingRuntimeService } from "../services/runtime.service"

export async function pingController(
    req: Request,
    res: Response
) {

    try {

        const { projectId } = req.body

        if (!projectId) {
            return res.status(400).json({ error: "projectId required" })
        }

        const result = await pingRuntimeService(projectId)

        res.json(result)

    } catch (err) {

        console.error("Ping error:", err)

        res.status(500).send("failed")

    }

}