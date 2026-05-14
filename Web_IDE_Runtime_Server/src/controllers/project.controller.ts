import { Request, Response }
    from "express"

import { deleteProjectService } from "../services/project.service"

export async function deleteProjectController(
    req: Request,
    res: Response
) {

    try {

        const { projectId } =
            req.body

        if (!projectId) {

            return res.status(400).json({
                error:
                    "projectId required"
            })

        }

        const result =
            await deleteProjectService(
                projectId
            )

        return res.json(result)

    }
    catch (err) {

        console.error(
            "Project delete failed:",
            err
        )

        return res.status(500).json({
            error:
                "Project deletion failed"
        })

    }

}