import { Router } from "express"
import { createFileController, deleteFileController, getFilesController, readFileController, updateFileController, readAllFilesController } from "../controllers/files.controller"

const router = Router()

router.get("/", getFilesController)
router.post("/create", createFileController)
router.post("/update", updateFileController)
router.post("/read", readFileController)
router.post("/read-all", readAllFilesController)
router.post("/delete", deleteFileController)

export default router