import { Router } from "express"
import { createFileController, deleteFileController, getFilesController, readFileController, updateFileController } from "../controllers/files.controller"

const router = Router()

router.get("/", getFilesController)
router.post("/create", createFileController)
router.post("/update", updateFileController)
router.post("/read", readFileController)
router.post("/delete", deleteFileController)

export default router