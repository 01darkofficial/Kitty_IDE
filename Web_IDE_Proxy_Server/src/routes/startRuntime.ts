import { Router } from "express"
import { startProjectContainer } from "../runtime/runtime"
import { runtimeMap } from "../runtime/runtimeMap"
import { lastUsedMap } from "../runtime/activity"

const router = Router()

router.post("/", async (req, res) => {
    try {

        const { projectId, projectRuntimeEnv, files } = req.body

        console.log("runtime_env: ", projectRuntimeEnv);

        if (!projectId) {
            return res.status(400).json({ error: "projectId required" })
        }

        /*
          Prevent duplicate starts
        */

        if (runtimeMap.has(projectId)) {
            const existingPort = runtimeMap.get(projectId)
            return res.json({
                port: existingPort
            })
        }

        /*
          Start container
        */
        await startProjectContainer(projectId, projectRuntimeEnv, files)

        runtimeMap.set(projectId, { host: "", port: 0 })
        lastUsedMap.set(projectId, Date.now())

        res.json({
            status: "started"
        })

    } catch (err) {
        console.error("Runtime start error:", err)
        res.status(500).send("failed")
    }
})

router.get("/status", (req, res) => {

    const { projectId } = req.query

    if (!projectId) {
        return res.status(400).send("projectId required")
    }

    if (runtimeMap.has(projectId as string)) {
        return res.json({
            running: true,
            port: runtimeMap.get(projectId as string)
        })
    }

    res.json({
        running: false
    })

})

export default router