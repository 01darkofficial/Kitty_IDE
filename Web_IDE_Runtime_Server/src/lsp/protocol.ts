/* -------------------------------------------------------------------------- */
/* JSON-RPC Types */
/* -------------------------------------------------------------------------- */

export interface LspRequest {
    jsonrpc: "2.0"
    id: number
    method: string
    params?: unknown
}

export interface LspResponse {
    jsonrpc: "2.0"
    id: number
    result?: unknown
    error?: {
        code: number
        message: string
        data?: unknown
    }
}

export interface LspNotification {
    jsonrpc: "2.0"
    method: string
    params?: unknown
}

export type LspMessage =
    | LspRequest
    | LspResponse
    | LspNotification

/* -------------------------------------------------------------------------- */
/* Type Guards */
/* -------------------------------------------------------------------------- */

export function isRequest(message: LspMessage): message is LspRequest {
    return "id" in message && "method" in message
}

export function isResponse(message: LspMessage): message is LspResponse {
    return "id" in message && ("result" in message || "error" in message)
}

export function isNotification(message: LspMessage): message is LspNotification {
    return !("id" in message) && "method" in message
}

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

export function parseMessage(raw: string): LspMessage {
    return JSON.parse(raw)
}

export function serializeMessage(message: LspMessage): string {
    return JSON.stringify(message)
}

export function createStdioMessage(message: LspMessage): string {

    const json = serializeMessage(message)

    return `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`
}