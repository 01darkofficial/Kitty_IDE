import { WebSocket } from "ws"

const terminalSocketMap = new Map<string, Set<WebSocket>>()

export function addTerminalSocket(
    projectId: string,
    socket: WebSocket
) {
    let set = terminalSocketMap.get(projectId)

    if (!set) {
        set = new Set()
        terminalSocketMap.set(projectId, set)
    }

    set.add(socket)
}

export function removeTerminalSocket(
    projectId: string,
    socket: WebSocket
) {
    const set = terminalSocketMap.get(projectId)

    if (!set) return

    set.delete(socket)

    if (set.size === 0) {
        terminalSocketMap.delete(projectId)
    }
}

export function getTerminalSockets(
    projectId: string
) {
    return terminalSocketMap.get(projectId) ?? []
}