import { Router } from "express"
import { getFilesController } from "../controllers/files.controller"

const router = Router()

router.get("/", getFilesController)

export default router