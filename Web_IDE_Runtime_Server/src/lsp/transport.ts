import { WebSocket } from "ws"
import { LspSession } from "../types/lsp"
import { parseMessage, serializeMessage } from "./protocol"
import { lspLogger } from "../utils/logger"
import { getLspSocket } from "../ws/lspSockets"


/**
 * Parses LSP messages received from the language server's stdout
 * and forwards complete messages to the connected WebSocket client.
 *
 * LSP messages use Content-Length framing, so stdout chunks may
 * contain partial, complete, or multiple messages.
 */
export function handleLspOutput(
    session: LspSession,
    chunk: Buffer
) {
    session.stdoutBuffer = Buffer.concat([session.stdoutBuffer, chunk,])

    while (true) {

        const headerEnd = session.stdoutBuffer.indexOf(Buffer.from("\r\n\r\n"))

        if (headerEnd === -1) break

        const header = session.stdoutBuffer.subarray(0, headerEnd).toString("ascii")
        const match = header.match(/Content-Length:\s*(\d+)/i)

        if (!match) {
            session.stdoutBuffer = Buffer.alloc(0)
            return
        }

        const contentLength = Number(match[1])
        const bodyStart = headerEnd + 4

        if (session.stdoutBuffer.length < bodyStart + contentLength) {
            break
        }

        const body = session.stdoutBuffer.subarray(bodyStart, bodyStart + contentLength)
        session.stdoutBuffer = session.stdoutBuffer.subarray(bodyStart + contentLength)

        const message = parseMessage(body.toString("utf-8"))

        // Forward the complete JSON-RPC message to the browser.
        const socket = getLspSocket(session.sessionKey)

        if (socket?.readyState === WebSocket.OPEN) {
            lspLogger.kittyDebug("[LSP → Client]", "method" in message ? message.method : `response ${message.id}`)
            socket.send(serializeMessage(message))
        }
    }
}
