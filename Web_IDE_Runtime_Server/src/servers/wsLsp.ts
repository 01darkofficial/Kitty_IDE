import { IncomingMessage } from "http"
import { WebSocket, WebSocketServer } from "ws"
import { disposeSession, getOrCreateSession } from "../lsp/manager"
import { setLspSocket, deleteLspSocket } from "../ws/lspSockets"
import { wsLspLogger } from "../utils/logger"
import { createStdioMessage, isRequest, parseMessage } from "../lsp/protocol"
import { pathToFileURL } from "url"

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

            if (isRequest(parsed) && parsed.method === "initialize") {
                parsed.params = {
                    ...(parsed.params as object),
                    rootUri: pathToFileURL(session.workspacePath).href,
                    workspaceFolders: [
                        {
                            uri: pathToFileURL(session.workspacePath).href,
                            name: session.projectId,
                        },
                    ],
                }
            }

            if (!session.process) {
                wsLspLogger.kittyWarn("[LSP] No language server process.")
                return
            }

            wsLspLogger.kittyDebug("[Client → TS-LSP]", parsed)
            // Forward the LSP message to the language server over stdio.
            session.process.stdin.write(createStdioMessage(parsed))

        } catch (err) {
            wsLspLogger.kittyError(
                "[LSP] Invalid JSON-RPC message:",
                err
            )
        }
    })

    socket.on("close", () => {
        wsLspLogger.kittyDebug(`[LSP] Disconnected → ${session.sessionKey}`)

        deleteLspSocket(session.sessionKey)
        disposeSession(session.userId, session.projectId)
    })

    socket.on("error", (err) => {
        wsLspLogger.kittyError("[LSP] Socket Error:", err)
    })
})
