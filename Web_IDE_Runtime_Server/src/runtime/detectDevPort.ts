import { runtimeMap, previewReadyMap } from "./runtimeMap"
import { resolveContainerAddress } from "./resolveContainerAddress"
import { runtimePortLogger } from "../utils/logger"

/**
 * Detects dev server port from runtime logs.
 *
 * Updates runtimeMap once a valid port
 * is detected and resolved.
 */
export async function detectDevPort(
    projectId: string,
    text: string
): Promise<void> {

    if (previewReadyMap.get(projectId)) {
        return
    }

    const cleaned = text.replace(/\x1B\[[0-9;]*[A-Za-z]/g, "")
    const match = cleaned.match(/(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/)

    if (!match) return

    const containerPort = Number(match[2])
    runtimePortLogger.kittyDebug("Port detected: ", { projectId, containerPort })

    try {
        /*
        Resolve host-mapped port
        */
        const { host, port } = await resolveContainerAddress(projectId, containerPort)

        runtimeMap.set(projectId, { host, port })
        previewReadyMap.set(projectId, true)

        runtimePortLogger.kittyLog("Runtime port mapped: ", { projectId, host, port })
    }
    catch (err) {
        runtimePortLogger.kittyError("Port resolution failed", { projectId, containerPort, err })
    }
}

/**
 * Rewrites localhost URLs for preview routing.
 */
export function rewritePreviewURL(
    projectId: string,
    text: string
): string {
    return text.replace(/http:\/\/localhost:\d+/, `http://localhost:4000/preview/${projectId}`)
}