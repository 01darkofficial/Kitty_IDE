import { Router } from "express"

import { createProjectController, deleteProjectController } from "../controllers/project.controller"
import multer from "multer"

const router = Router()

const upload = multer({ storage: multer.memoryStorage(), })

/*
Create project
*/

router.post("/create", upload.array("zip"), createProjectController)

/*
Delete project
*/

router.post("/delete", deleteProjectController)

export default router