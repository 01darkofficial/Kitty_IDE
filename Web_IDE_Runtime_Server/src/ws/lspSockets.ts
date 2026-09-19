import { WebSocket } from "ws"

const lspSockets = new Map<string, WebSocket>()

export function getLspSocket(sessionKey: string) {
    return lspSockets.get(sessionKey)
}

export function setLspSocket(sessionKey: string, socket: WebSocket) {
    lspSockets.set(sessionKey, socket)
}

export function deleteLspSocket(sessionKey: string) {
    lspSockets.delete(sessionKey)
}

export function hasLspSocket(sessionKey: string) {
    return lspSockets.has(sessionKey)
}