import { WebSocketServer } from "ws"
import * as pty from "node-pty"
import { ensureContainerRunning } from "../runtime/ensureContainerRunning"
import { detectDevPort } from "../runtime/detectDevPort"
import { previewPrintedMap, previewReadyMap } from "../runtime/runtimeMap"
import { lastUsedMap } from "../runtime/activity"
import { hasWatcher, registerWatcher } from "../runtime/watcherRegistry"
import { startFileWatcher } from "../runtime/fileWatcher"
import { initialWorkspaceScan, shouldRunInitialScan } from "../runtime/initialWorkspaceScan"
import { terminalLogger } from "../utils/logger"

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

            terminalLogger.kittyLog("Terminal PTY started: ", containerName)

            // Buffer used to detect dev server output
            let devPortBuffer = ""

            // Terminal output → browser
            ptyProcess.onData(async (data: string) => {

                socket.send(data)
                devPortBuffer += data

                try {
                    await detectDevPort(projectId, devPortBuffer)
                }

                catch (err) {
                    terminalLogger.kittyError("Dev port detection failed: ", err)
                }

                // Print preview URL once ready
                if (previewReadyMap.get(projectId) && !previewPrintedMap.get(projectId)) {

                    const previewURL = `http://${projectId}.preview.localhost:4000`
                    socket.send(`\nPreview: ${previewURL}\n`)

                    previewPrintedMap.set(projectId, true)
                    devPortBuffer = ""
                    terminalLogger.kittyLog("Preview ready: ", previewURL)
                }
            })

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
                    ptyProcess.kill()
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