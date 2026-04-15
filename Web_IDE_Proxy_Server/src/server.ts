import { createHTTPServer } from "./servers/httpServer"
import { setupTerminalWS } from "./servers/wsTerminal"
import { setupProjectWS } from "./servers/wsProject"
import { startCleanupLoop } from "./runtime/cleanup"
import { handleUpgrade } from "./servers/wsRouter"
import { serverLogger } from "./utils/logger"

/**
 * Application entry point.
 *
 * Responsibilities:
 * - Initialize HTTP server
 * - Register WebSocket handlers
 * - Start runtime cleanup loop
 * - Attach upgrade router
 */

// Log current runtime environment
serverLogger.kittyLog("NODE_ENV:", process.env.NODE_ENV)

const server = createHTTPServer()

// Register WebSocket handlers
setupTerminalWS()
setupProjectWS()

// Handle WebSocket upgrade routing
server.on("upgrade", (req, socket, head) => {

    if (handleUpgrade(req, socket, head)) return

    // Destroy socket if no handler matched
    socket.destroy()

})

// Start runtime cleanup background task
startCleanupLoop()

// Start HTTP server
server.listen(4000, () => {
    serverLogger.kittyLog("Proxy running on http://localhost:4000")

})