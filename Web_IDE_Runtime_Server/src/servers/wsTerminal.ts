import { WebSocketServer } from "ws"
import * as pty from "node-pty"
import { ensureContainerRunning } from "../runtime/ensureContainerRunning"
import { detectDevPort } from "../runtime/detectDevPort"
import { previewReadyMap, runtimeMap } from "../runtime/runtimeMap"
import { lastUsedMap } from "../runtime/activity"
import { hasWatcher, registerWatcher } from "../runtime/watcherRegistry"
import { startFileWatcher } from "../runtime/fileWatcher"
import { initialWorkspaceScan, shouldRunInitialScan } from "../runtime/initialWorkspaceScan"
import { terminalLogger } from "../utils/logger"
import { TerminalProcessor } from "../runtime/terminalProcessor"
import { addTerminalSocket, getTerminalSockets, removeTerminalSocket } from "../ws/terminalSockets"
import { terminalMap, terminalLastSeenMap } from "../runtime/terminalRegistry"
import { ScrollbackBuffer } from "../runtime/scrollbackBuffer"

// Terminal WebSocket server instance.
// Uses noServer because upgrade routing is handled externally.
export const terminalWss = new WebSocketServer({
    noServer: true
})

/**
 * Registers terminal WebSocket connection handling.
 */
export function setupTerminalWS(): void {

    terminalWss.on("connection", async (socket, req) => {

        terminalLogger.kittyLog("Terminal WS connected")

        try {

            // req.url is relative — base URL required
            const url = new URL(req.url!, "http://localhost")

            const projectId = url.searchParams.get("projectId")

            if (!projectId) {
                terminalLogger.kittyWarn("Terminal connection missing projectId")
                socket.close()
                return
            }

            addTerminalSocket(projectId, socket)

            // Ensure project container is available
            await ensureContainerRunning(projectId)

            // Start watcher if missing
            if (!hasWatcher(projectId)) {
                terminalLogger.kittyDebug("Starting watcher: ", projectId)

                const watcher = startFileWatcher(projectId)
                registerWatcher(projectId, watcher)
            }

            // Initial workspace scan
            const needsScan = await shouldRunInitialScan(projectId)

            if (needsScan) {
                terminalLogger.kittyLog("Running initial scan: ", projectId)
                await initialWorkspaceScan(projectId)
            }

            // Spawn terminal PTY
            const containerName = `project-${projectId}`

            let session = terminalMap.get(projectId)
            const isNewPty = !session

            if (!session) {
                const ptyProcess = pty.spawn(
                    "docker",
                    [
                        "exec",
                        "-it",
                        containerName,
                        "bash",
                        "--login"
                    ],
                    {
                        name: "xterm-256color",
                        cols: 120,
                        rows: 30,
                        env: process.env
                    }
                )

                session = {
                    pty: ptyProcess,
                    terminalProcessor: new TerminalProcessor(projectId),
                    scrollback: new ScrollbackBuffer()
                }

                terminalMap.set(projectId, session)
                terminalLogger.kittyLog("Terminal PTY created! ", containerName)
            }
            else {
                terminalLogger.kittyLog("Reusing PTY! ", containerName)
            }

            terminalLastSeenMap.set(projectId, Date.now())
            terminalLogger.kittyLog("Terminal PTY started: ", containerName)

            const ptyProcess = session.pty
            const history = session.scrollback.toString()

            if (history.length > 0) {
                socket.send(JSON.stringify({
                    type: "terminal-history",
                    data: history
                }))
            }

            if (!isNewPty) {
                setTimeout(() => {
                    ptyProcess.write("\n")
                }, 100)
            }

            // Terminal output → browser
            if (isNewPty) {

                ptyProcess.onData(async (data: string) => {
                    session.scrollback.push(data)
                    session.terminalProcessor.process(data)

                    const sockets = getTerminalSockets(projectId)

                    for (const socket of sockets) {
                        if (socket.readyState === socket.OPEN) {
                            socket.send(data)
                        }
                    }

                    for (const event of session.terminalProcessor.getEvents()) {

                        switch (event.type) {
                            case "port-started":
                                try {
                                    await detectDevPort(projectId, event.port)
                                } catch (err) {
                                    terminalLogger.kittyError("Failed to detect dev port: ", err)
                                }
                                break

                            case "port-stopped":
                                runtimeMap.delete(projectId)
                                previewReadyMap.delete(projectId)

                                const sockets = getTerminalSockets(projectId)

                                for (const socket of sockets) {
                                    if (socket.readyState === socket.OPEN) {
                                        socket.send(JSON.stringify({
                                            type: "preview-stopped",
                                            port: event.port
                                        }))
                                    }
                                }

                                break
                        }
                    }
                })
            }

            // Browser input → terminal
            socket.on("message", (msg) => {
                try {
                    const parsed = JSON.parse(msg.toString())

                    // Handle terminal resize
                    if (parsed.type === "resize") {
                        ptyProcess.resize(parsed.cols, parsed.rows)
                        return
                    }
                }

                catch (err) {
                    // Ignore JSON parse errors.
                    // Most messages are plain terminal input.
                }

                ptyProcess.write(msg.toString())
                lastUsedMap.set(projectId, Date.now())
            })

            // Cleanup on disconnect
            socket.on("close", () => {
                try {
                    removeTerminalSocket(projectId, socket)
                    terminalLastSeenMap.set(projectId, Date.now())
                    terminalLogger.kittyLog("Terminal closed: ", projectId)
                }
                catch (err) {
                    terminalLogger.kittyError("Failed to kill PTY: ", err)
                }
            })
        }

        catch (err) {
            terminalLogger.kittyError("Terminal setup failed: ", err)
            socket.close()
        }
    })

}