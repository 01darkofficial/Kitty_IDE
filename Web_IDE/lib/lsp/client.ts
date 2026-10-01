import { PublishDiagnosticsParams } from "@/types/lsp"
import { lspLogger } from "@/utils/logger"

let socket: WebSocket | null = null
let requestId = 1

const pending = new Map<number, (value: any) => void>()
const diagnosticListeners = new Set<(params: PublishDiagnosticsParams) => void>()

/**
 * Establishes the WebSocket connection to the LSP server.
 */
export function connectLsp(
    projectId: string,
    userId: string,
): Promise<WebSocket> {

    if (socket?.readyState === WebSocket.OPEN) {
        return Promise.resolve(socket)
    }

    if (socket?.readyState === WebSocket.CONNECTING) {
        return new Promise((resolve) => {
            socket!.addEventListener("open", () => resolve(socket!), { once: true })
        })
    }

    socket = new WebSocket(`ws://localhost:4000/lsp?projectId=${projectId}&userId=${userId}`)

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data)

        // ---------- Responses ----------
        if ("id" in message && pending.has(message.id)) {
            pending.get(message.id)?.(message.result)
            pending.delete(message.id)
            return
        }

        // Respond to configuration requests from the language server.
        if ("method" in message && message.method === "workspace/configuration") {
            socket?.send(JSON.stringify({
                jsonrpc: "2.0",
                id: message.id,
                result: [{ format: { semicolons: "insert" } }],
            }))
            return
        }

        // ---------- Notifications ----------
        if (!("method" in message)) return

        switch (message.method) {
            case "textDocument/publishDiagnostics":
                // Forward diagnostics to Monaco.
                diagnosticListeners.forEach((listener) => listener(message.params))
                break

            case "window/logMessage":
                // Language-server informational messages.
                lspLogger.kittyDebug("[TS-LSP]", message.params.message)
                break

            default:
                break
        }
    }

    socket.onclose = () => {
        socket = null
        pending.clear()
    }

    return new Promise((resolve, reject) => {
        socket!.addEventListener("open", () => resolve(socket!), { once: true })
        socket!.addEventListener("error", reject, { once: true })
    })
}

/**
 * Registers a listener for diagnostics published by the language server.
 */
export function onDiagnostics(
    listener: (params: PublishDiagnosticsParams) => void
) {
    diagnosticListeners.add(listener)
    return () => {
        diagnosticListeners.delete(listener)
    }
}

/**
 * Sends a JSON-RPC request to the language server and waits for its response.
 */
export function sendRequest<T = unknown>(
    method: string,
    params: unknown,
): Promise<T> {

    const id = requestId++

    return new Promise<T>((resolve, reject) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            reject(new Error("LSP socket is not connected"))
            return
        }

        pending.set(id, resolve)
        socket.send(JSON.stringify({
            jsonrpc: "2.0",
            id,
            method,
            params,
        }))
    })
}

/**
 * Sends a JSON-RPC notification to the language server.
 */
export function sendNotification(method: string, params: unknown) {

    if (!socket || socket.readyState !== WebSocket.OPEN) {
        lspLogger.kittyWarn(`[LSP] Cannot send ${method}: socket is not connected`)
        return
    }

    socket.send(JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
    }))
}

/**
 * Notifies the language server that a document has been opened.
 */
export function sendDidOpen(
    uri: string,
    languageId: string,
    text: string,
    version = 1,
) {
    sendNotification("textDocument/didOpen", {
        textDocument: {
            uri,
            languageId,
            version,
            text,
        },
    })
}

/**
 * Notifies the language server of a document change.
 */
export function sendDidChange(
    uri: string,
    version: number,
    text: string,
) {
    // Send the complete document rather than an incremental text edit.
    sendNotification("textDocument/didChange", {
        textDocument: { uri, version },
        contentChanges: [{ text }],
    })
}

/**
 * Notifies the language server that a document has been closed.
 */
export function sendDidClose(uri: string) {
    sendNotification("textDocument/didClose", {
        textDocument: { uri },
    })
}
