import { IncomingMessage } from "http"
import { WebSocket, WebSocketServer } from "ws"

import { getOrCreateSession } from "../lsp/manager"
import { setLspSocket, deleteLspSocket } from "../ws/lspSockets"
import { wsLspLogger } from "../utils/logger"
import { createStdioMessage, isRequest, parseMessage } from "../lsp/protocol"

export const lspWss = new WebSocketServer({ noServer: true })

lspWss.on("connection", (socket: WebSocket, req: IncomingMessage) => {

    const url = new URL(req.url ?? "", "http://localhost")

    const projectId = url.searchParams.get("projectId")
    const userId = url.searchParams.get("userId")

    if (!projectId || !userId) {
        wsLspLogger.kittyWarn("[LSP] Missing projectId or userId")
        socket.close(1008, "Missing projectId or userId")
        return
    }

    const session = getOrCreateSession(userId, projectId)

    setLspSocket(session.sessionKey, socket)

    wsLspLogger.kittyDebug(`[LSP] Connected → ${session.sessionKey}`)

    socket.on("message", (message) => {
        try {
            const parsed = parseMessage(message.toString())

            if (isRequest(parsed)) {
                wsLspLogger.kittyDebug("[LSP] Request:", parsed.method)
            } else {
                wsLspLogger.kittyDebug("[LSP] Message received")
            }

            if (!session.process) {
                wsLspLogger.kittyWarn("[LSP] No language server process.")
                return
            }
            session.process.stdin.write(createStdioMessage(parsed))

        } catch (err) {
            wsLspLogger.kittyError("[LSP] Invalid JSON-RPC message:", err)
        }
    })

    socket.on("close", () => {
        wsLspLogger.kittyDebug(`[LSP] Disconnected → ${session.sessionKey}`)

        // Remove only the socket.
        // The session stays alive until idle cleanup.
        deleteLspSocket(session.sessionKey)
    })

    socket.on("error", (err) => {
        wsLspLogger.kittyError("[LSP] Socket Error:", err)
    })
})