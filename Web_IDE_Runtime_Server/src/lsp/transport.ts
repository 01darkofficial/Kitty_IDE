import { LspSession } from "../types/lsp"
import { parseMessage, serializeMessage } from "./protocol"
import { lspLogger } from "../utils/logger"
import { getLspSocket } from "../ws/lspSockets"

export function handleLspOutput(
    session: LspSession,
    chunk: Buffer
) {

    session.stdoutBuffer += chunk.toString()

    while (true) {

        const headerEnd = session.stdoutBuffer.indexOf("\r\n\r\n")

        if (headerEnd === -1) break

        const header = session.stdoutBuffer.slice(0, headerEnd)

        const match = header.match(/Content-Length:\s*(\d+)/i)

        if (!match) {
            session.stdoutBuffer = ""
            return
        }

        const contentLength = Number(match[1])

        const bodyStart = headerEnd + 4

        if (session.stdoutBuffer.length < bodyStart + contentLength) {
            break
        }

        const body = session.stdoutBuffer.slice(
            bodyStart,
            bodyStart + contentLength
        )

        session.stdoutBuffer = session.stdoutBuffer.slice(
            bodyStart + contentLength
        )

        const message = parseMessage(body)

        const socket = getLspSocket(session.sessionKey)

        if (socket?.readyState === socket!.OPEN) {
            socket.send(serializeMessage(message))
        }

        lspLogger.kittyDebug("[TS-LSP] Outgoing:", message)
    }
}