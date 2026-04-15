import { Router } from "express"
import { pingController } from "../controllers/activity.controller"

const router = Router()

router.post("/", pingController)

export default router