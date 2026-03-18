import { Router } from "express"
import { getRunningContainer, startProjectContainer } from "../runtime/runtime"

const router = Router()

router.post("/", async (req, res) => {
    try {
        const { projectId } = req.body

        const container = await getRunningContainer(projectId)
        console.log("PING ROUTE HIT")
        if (!container) {
            return res.json({ status: "stopped" })
        }


        res.json({
            status: "running",
            port: container.port
        })
    } catch (err) {
        console.error("Run error:", err)
        res.status(500).send("failed")
    }
})

export default router