import { IncomingMessage } from "http"
import { terminalWss } from "./wsTerminal"
import { projectWss } from "./wsProject"
import { runtimeMap } from "../runtime/runtimeMap"
import { proxy } from "./previewProxy"
import { lastUsedMap } from "../runtime/activity"
import { Duplex } from "stream"
import { WebSocketServer } from "ws"
import { upgradeLogger } from "../utils/logger"

/**
 * Performs standard WebSocket upgrade flow.
 * Shared between multiple WebSocket servers.
 */
function upgradeWS(
    wss: WebSocketServer,
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer
): void {
    upgradeLogger.kittyDebug("Upgrading WebSocket connection")
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req)
    })
}

/**
 * Routes HTTP upgrade requests to the appropriate WebSocket
 * handler or preview runtime proxy.
 *
 * Returns:
 * true  → request handled
 * false → not handled (fallback required)
 */
export function handleUpgrade(
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer
): boolean {

    const url = req.url || ""
    const host = req.headers.host || ""

    // Terminal WebSocket (/terminal/*)
    if (url.startsWith("/terminal")) {
        upgradeLogger.kittyDebug("Terminal WS upgrade: ", url)
        upgradeWS(terminalWss, req, socket, head)
        return true
    }

    // Project WebSocket (/project/*)
    if (url.startsWith("/project")) {
        upgradeLogger.kittyDebug("Project WS upgrade: ", url)
        upgradeWS(projectWss, req, socket, head)
        return true
    }

    // Preview Proxy via subdomain:
    // {projectId}.preview.localhost
    if (host.includes(".preview.localhost")) {

        upgradeLogger.kittyDebug("Preview WS request:", host)

        const projectId = host.split(".")[0]
        const runtime = runtimeMap.get(projectId)

        // Reject if runtime is unavailable
        if (!runtime || !runtime.host || runtime.port === 0) {
            upgradeLogger.kittyWarn("Preview runtime unavailable:", projectId)
            socket.destroy()
            return true
        }

        // Track runtime activity (used for idle cleanup)
        lastUsedMap.set(projectId, Date.now())

        proxy.ws(req, socket, head, {
            target: `http://${runtime.host}:${runtime.port}`,
            changeOrigin: true
        })

        return true

    }

    // No matching upgrade route
    upgradeLogger.kittyDebug("Unhandled WS upgrade:", url, host)

    return false
}