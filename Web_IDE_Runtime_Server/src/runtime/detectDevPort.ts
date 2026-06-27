import { runtimeMap, previewReadyMap } from "./runtimeMap"
import { resolveContainerAddress } from "./resolveContainerAddress"
import { runtimePortLogger } from "../utils/logger"
import { getTerminalSockets } from "../ws/terminalSockets"

const resolvingProjects = new Set<string>()

/**
 * Detects dev server port from runtime logs.
 *
 * Updates runtimeMap once a valid port
 * is detected and resolved.
 */
export async function detectDevPort(
    projectId: string,
    containerPort: number
): Promise<void> {

    if (resolvingProjects.has(projectId)) {
        return
    }
    runtimePortLogger.kittyDebug("Port detected: ", {
        projectId,
        containerPort
    })
    try {
        /*
        Resolve host-mapped port
        */
        const { host, port } = await resolveContainerAddress(projectId, containerPort)

        runtimeMap.set(projectId, { host, port })
        previewReadyMap.set(projectId, true)

        const previewURL = `http://${projectId}.preview.localhost:4000`
        const sockets = getTerminalSockets(projectId)

        sockets?.forEach(socket => {
            if (socket.readyState === socket.OPEN) {
                socket.send(JSON.stringify({
                    type: "preview-ready",
                    port,
                    url: previewURL
                }))
            }
        })
    }
    catch (err) {
        runtimePortLogger.kittyError("Port resolution failed", { projectId, containerPort, err })
    } finally {
        resolvingProjects.delete(projectId)
    }
}