import { Router } from "express"
import docker from "../runtime/docker"

const router = Router()

// GET /files?projectId=...
router.get("/", async (req, res) => {
    const projectId = req.query.projectId as string

    if (!projectId) {
        return res.status(400).json({ error: "projectId required" })
    }

    const containerName = `project-${projectId}`
    const container = docker.getContainer(containerName)

    try {
        // -------------------------
        // exec: list files recursively
        // -------------------------
        const exec = await container.exec({
            Cmd: ["sh", "-c", "ls -R /workspace"],
            AttachStdout: true,
            AttachStderr: true
        })

        const stream = await exec.start({ hijack: true })

        let output = ""

        // -------------------------
        // collect stream
        // -------------------------
        stream.on("data", (chunk: Buffer) => {
            // strip docker header (8 bytes)
            if (chunk.length > 8) {
                const payload = chunk.slice(8)
                output += payload.toString("utf-8")
            }
        })

        stream.on("end", () => {
            // -------------------------
            // parse into structure
            // -------------------------
            const files = parseLsOutput(output)

            res.json({ files })
        })

    } catch (err) {
        console.error("FILES ERROR:", err)
        res.status(500).json({ error: "failed to read files" })
    }
})

export default router


// -------------------------
// helper: parse ls -R output
// -------------------------
function parseLsOutput(output: string) {

    const result: {
        path: string
        files: string[]
    }[] = []

    const sections = output.split("\n\n") // 🔥 split by blocks

    for (const section of sections) {

        const lines = section.split("\n").filter(Boolean)

        if (lines.length === 0) continue

        const dirLine = lines[0]

        if (!dirLine.endsWith(":")) continue

        const path = dirLine.replace(":", "")

        const files = lines
            .slice(1)
            .flatMap(line => line.split(/\s+/))
            .filter(Boolean)

        result.push({
            path,
            files
        })
    }

    return result
}