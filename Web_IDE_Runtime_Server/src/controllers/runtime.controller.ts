import { Request, Response } from "express"
import { startRuntimeService, runtimeStatusService } from "../services/runtime.service"
import { runtimeLogger } from "../utils/logger"


export async function startRuntimeController(
    req: Request,
    res: Response
) {
    try {
        const { projectId, projectRuntimeEnv } = req.body
        const result = await startRuntimeService(projectId, projectRuntimeEnv)

        res.json(result)
    } catch (err) {
        runtimeLogger.kittyError("Runtime start error:", err)
        res.status(500).send("failed")
    }
}


export function runtimeStatusController(
    req: Request,
    res: Response
) {
    const { projectId } = req.query
    const result = runtimeStatusService(projectId as string)

    res.json(result)
}