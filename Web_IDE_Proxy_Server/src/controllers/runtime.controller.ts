import { Request, Response } from "express"

import {
    startRuntimeService,
    runtimeStatusService
} from "../services/runtime.service"



export async function startRuntimeController(
    req: Request,
    res: Response
) {

    try {

        const {
            projectId,
            projectRuntimeEnv,
            files
        } = req.body

        const result =
            await startRuntimeService(
                projectId,
                projectRuntimeEnv,
                files
            )

        res.json(result)

    } catch (err) {

        console.error("Runtime start error:", err)

        res.status(500).send("failed")

    }

}


export function runtimeStatusController(
    req: Request,
    res: Response
) {

    const { projectId } = req.query

    const result =
        runtimeStatusService(projectId as string)

    res.json(result)

}