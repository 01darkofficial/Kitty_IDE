import { Router } from "express"
import {
    startRuntimeController,
    runtimeStatusController
} from "../controllers/runtime.controller"

const router = Router()

router.post("/", startRuntimeController)

router.get("/status", runtimeStatusController)

export default router