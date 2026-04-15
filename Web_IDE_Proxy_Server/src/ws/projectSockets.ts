import WebSocket from "ws"
import { wsLogger } from "../utils/logger"

// Active project WebSocket registry
export const projectSockets = new Map<string, WebSocket>()

/**
 * Sends a message to a project's active WebSocket.
 */
export function notifyProject(
    projectId: string,
    payload: any
) {

    const socket = projectSockets.get(projectId)

    if (!socket) {
        wsLogger.kittyDebug("No project socket found: ", projectId)
        return
    }

    if (socket.readyState === WebSocket.OPEN) {
        wsLogger.kittyDebug("Sending project WS payload: ", projectId)
        socket.send(JSON.stringify(payload))
    }

}