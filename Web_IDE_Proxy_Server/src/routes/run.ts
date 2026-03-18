import { Router } from "express"
import { startProjectContainer } from "../runtime/runtime"
import { runtimeMap } from "../runtime/runtimeMap"

const router = Router()

router.post("/", async (req, res) => {
    try {
        const { projectId, files } = req.body
        console.log("RUN TRIGGERED")

        console.log("RUN REQUEST:", projectId)

        if (!projectId) {
            return res.status(400).json({ error: "projectId required" })
        }

        // remove stale mapping
        runtimeMap.delete(projectId)

        const port = await startProjectContainer(projectId, files)

        runtimeMap.set(projectId, port)

        console.log("CONTAINER STARTED:", projectId, "→", port)

        res.json({ port })

    } catch (err) {
        console.error("Run error:", err)
        res.status(500).send("failed")
    }
})

export default router