import docker from "./docker"
import { lastUsedMap } from "./activity"

const TIMEOUT = 10 * 60 * 1000 // 10 minutes

export function startCleanupLoop(): void {

    setInterval(async () => {

        const now = Date.now()

        for (const [projectId, lastUsed] of lastUsedMap) {

            if (now - lastUsed < TIMEOUT) continue

            const containerName = `project-${projectId}`

            try {

                const container = docker.getContainer(containerName)
                const info = await container.inspect()

                if (info.State.Running) {
                    console.log("Stopping idle container:", projectId)
                    await container.stop()
                }

            } catch (err: any) {
                if (err.statusCode !== 404) {
                    console.error("Cleanup error:", err)
                }
            }
        }

    }, 60 * 1000) // check every 1 min
}