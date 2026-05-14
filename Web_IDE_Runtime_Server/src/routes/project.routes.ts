import { Router } from "express"

import { deleteProjectController } from "../controllers/project.controller"

const router = Router()

/*
Delete project runtime
*/

router.post(
    "/delete",
    deleteProjectController
)

export default router