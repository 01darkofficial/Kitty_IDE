import { WebSocketServer } from "ws"
import { projectSockets } from "../ws/projectSockets"
import { wsLogger } from "../utils/logger"

// WebSocket server for project-level communication.
// Uses noServer because upgrade routing is handled externally.
export const projectWss = new WebSocketServer({
    noServer: true
})

// Ensures connection handler is registered only once.
let initialized = false

/**
 * Registers project WebSocket connection handling.
 *
 * Expected format:
 * ws://host/project?projectId=<id>
 */
export function setupProjectWS(): void {

    if (initialized) return

    initialized = true

    projectWss.on("connection", (socket, req) => {

        try {

            wsLogger.kittyLog("Project WS connection received")

            // req.url is relative — base URL required
            const url = new URL(req.url!, "http://localhost")

            const projectId = url.searchParams.get("projectId")

            if (!projectId) {
                wsLogger.kittyWarn("Project WS missing projectId")
                socket.close()
                return
            }

            // Register active project socket
            projectSockets.set(projectId, socket)

            wsLogger.kittyLog("Project WS connected: ", projectId)

            // Cleanup on disconnect
            socket.on("close", () => {
                projectSockets.delete(projectId)
                wsLogger.kittyLog("Project WS closed: ", projectId)
            })
        }

        catch (err) {
            wsLogger.kittyError("Project WS connection failed: ", err)
            socket.close()
        }
    })
}