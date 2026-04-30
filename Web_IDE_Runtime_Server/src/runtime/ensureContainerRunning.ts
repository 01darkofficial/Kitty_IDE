import Dockerode from "dockerode"
import docker from "./docker"
import { runtimeMap } from "./runtimeMap"
import { containerRuntimeLogger } from "../utils/logger"

/**
 * Ensures container exists and is running.
 *
 * Behavior:
 * - Starts container if stopped
 * - Resolves container IP
 * - Updates runtimeMap host entry
 *
 * Returns running container instance.
 */
export async function ensureContainerRunning(
    projectId: string
): Promise<Dockerode.Container> {

    const containerName = `project-${projectId}`
    const container = docker.getContainer(containerName)

    containerRuntimeLogger.kittyDebug("Inspecting container: ", { projectId })

    try {

        let info = await container.inspect()

        /*
        Start container if stopped
        */

        if (!info.State.Running) {

            containerRuntimeLogger.kittyLog("Starting stopped container: ", { projectId })

            await container.start()

            // Allow network initialization
            await new Promise(
                r => setTimeout(r, 500)
            )

            info = await container.inspect()
        }

        /*
        Resolve container network IP
        */

        const networks = info.NetworkSettings.Networks
        const networkNames = Object.keys(networks)

        if (networkNames.length === 0) {
            containerRuntimeLogger.kittyError("Container has no networks: ", { projectId })
            throw new Error("No networks found for container")
        }

        const firstNetwork = networks[networkNames[0]]
        const ip = firstNetwork.IPAddress

        if (!ip) {
            containerRuntimeLogger.kittyError("Container IP missing: ", { projectId })
            throw new Error("Container IP missing")
        }

        containerRuntimeLogger.kittyDebug("Container IP resolved: ", { projectId, ip })

        /*
        Update runtime registry
        */

        const existing = runtimeMap.get(projectId)
        runtimeMap.set(projectId, { host: ip, port: existing?.port ?? 0 })

        containerRuntimeLogger.kittyDebug("Runtime host updated: ", { projectId, ip })

        /*
        Fallback port detection trigger
        */

        setTimeout(() => {
            const runtime = runtimeMap.get(projectId)
            if (runtime && runtime.port === 0) {
                containerRuntimeLogger.kittyWarn("Port still unresolved: ", { projectId })
            }
        }, 2000)
    }
    catch (err: any) {
        if (err.statusCode === 404) {
            containerRuntimeLogger.kittyError("Container missing: ", { projectId })
            throw new Error("Container missing")
        }

        containerRuntimeLogger.kittyError("Container ensure failed", { projectId, err })
        throw err
    }

    return container
}