import { wsClientLogger } from "@/utils/logger"

let ws: WebSocket | null = null

/**
 * Establishes project WebSocket connection
 * with automatic reconnection support.
 */
export function connectProjectWS(
    projectId: string,
    onMessage: (msg: any) => void
) {

    wsClientLogger.kittyLog("Connecting project WS: ", projectId)

    // Prevent duplicate connections
    if (ws && ws.readyState === WebSocket.OPEN) {
        wsClientLogger.kittyDebug("Project WS already connected: ", projectId)
        return
    }

    const protocol = location.protocol === "https:" ? "wss" : "ws"
    const url = `${protocol}://localhost:4000/project?projectId=${projectId}`

    let retryDelay = 1000

    ws = new WebSocket(url)

    ws.onopen = () => {
        wsClientLogger.kittyLog("Project WS connected: ", projectId)
        // Reset retry delay
        retryDelay = 1000
    }

    ws.onmessage = (event) => {

        try {
            const msg = JSON.parse(event.data)
            onMessage(msg)
        }

        catch {
            wsClientLogger.kittyWarn("Invalid WS message received: ", event.data)
        }
    }

    ws.onclose = () => {

        wsClientLogger.kittyWarn("Project WS closed, reconnecting: ", projectId)

        // Exponential reconnect
        setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 10000)
            wsClientLogger.kittyDebug("Retrying WS connection in: ", retryDelay)
            connectProjectWS(projectId, onMessage)
        }, retryDelay)
    }

    ws.onerror = (err) => {
        wsClientLogger.kittyError("Project WS error: ", projectId, err)
        ws?.close()
    }

}

/**
 * Gracefully closes active project WebSocket.
 */
export function closeProjectWS() {

    if (ws) {
        wsClientLogger.kittyLog("Closing project WS")
        ws.onclose = null
        ws.close()
        ws = null
    }
}