import { Router } from "express"
import { startProjectContainer } from "../runtime/runtime"
import { runtimeMap } from "../runtime/runtimeMap"
import { lastUsedMap } from "../runtime/activity"

const router = Router()

router.post("/", async (req, res) => {
    try {

        const { projectId, files } = req.body

        console.log("RUNTIME START REQUEST:", projectId)

        if (!projectId) {
            return res
                .status(400)
                .json({ error: "projectId required" })
        }

        /*
          Prevent duplicate starts
        */

        if (runtimeMap.has(projectId)) {

            const existingPort =
                runtimeMap.get(projectId)

            console.log(
                "Runtime already exists:",
                projectId,
                "→",
                existingPort
            )

            return res.json({
                port: existingPort
            })
        }

        /*
          Start container
        */

        const port =
            await startProjectContainer(
                projectId,
                files
            )

        runtimeMap.set(projectId, port)

        lastUsedMap.set(
            projectId,
            Date.now()
        )

        console.log(
            "CONTAINER STARTED:",
            projectId,
            "→",
            port
        )

        res.json({ port })

    } catch (err) {

        console.error("Runtime start error:", err)

        res.status(500).send("failed")
    }
})

export default router