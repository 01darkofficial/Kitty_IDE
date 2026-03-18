import { Router } from "express"
import { startProjectContainer } from "../runtime/runtime"
import { runtimeMap } from "../runtime/runtimeMap"
import { lastUsedMap } from "../runtime/activity"

const router = Router()

router.post("/", async (req, res) => {
    try {
        const { projectId, files } = req.body
        console.log("RUN TRIGGERED")

        console.log("RUN REQUEST:", projectId)

        if (!projectId) {
            return res.status(400).json({ error: "projectId required" })
        }

        const port = await startProjectContainer(projectId, files)

        runtimeMap.set(projectId, port)
        lastUsedMap.set(projectId, Date.now())
        console.log("CONTAINER STARTED:", projectId, "→", port)

        res.json({ port })

    } catch (err) {
        console.error("Run error:", err)
        res.status(500).send("failed")
    }
})

export default router