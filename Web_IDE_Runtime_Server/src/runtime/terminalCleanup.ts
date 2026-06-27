import { terminalMap, terminalLastSeenMap } from "./terminalRegistry"
import { terminalLogger } from "../utils/logger"

const PTY_TIMEOUT = 5 * 60 * 1000

setInterval(() => {
    const now = Date.now()

    for (const [projectId, session] of terminalMap) {
        const lastSeen = terminalLastSeenMap.get(projectId) ?? now

        if (now - lastSeen > PTY_TIMEOUT) {
            terminalLogger.kittyLog("Killing inactive PTY", projectId)
            session.pty.kill()
            terminalMap.delete(projectId)
            terminalLastSeenMap.delete(projectId)
        }
    }
}, 60_000)