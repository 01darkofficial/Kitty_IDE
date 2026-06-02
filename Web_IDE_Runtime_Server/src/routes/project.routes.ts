import { Router } from "express"
import { createWorkspaceController, importWorkspaceController, deleteProjectController } from "../controllers/project.controller"
import multer from "multer"

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), })

router.post("/createWorkspace", createWorkspaceController)
router.post("/importWorkspace", upload.array("zip"), importWorkspaceController)
router.post("/delete", deleteProjectController)

export default router