import { WebSocketServer } from "ws"
import { ensureContainerRunning } from "../runtime/ensureContainerRunning"
import { detectDevPort } from "../runtime/detectDevPort"
import { previewPrintedMap, previewReadyMap, runtimeMap } from "../runtime/runtimeMap"
import { proxy } from "./previewProxy"
import { lastUsedMap } from "../runtime/activity"
import { hasWatcher, registerWatcher } from "../runtime/watcherRegistry"
import { startFileWatcher } from "../runtime/fileWatcher"
import { initialWorkspaceScan, shouldRunInitialScan } from "../runtime/initialWorkspaceScan"

export const wss = new WebSocketServer({
    noServer: true
})

export function setupTerminalWS(): void {

    wss.on("connection", async (socket, req) => {

        console.log("WS connected")

        try {

            const url = new URL(req.url!, "http://localhost")
            const projectId = url.searchParams.get("projectId")

            if (!projectId) {
                socket.close()
                return
            }

            console.log("hasWatcher:", projectId, hasWatcher(projectId))

            const container =
                await ensureContainerRunning(projectId)

            /*
            Start watcher if needed
            */

            if (!hasWatcher(projectId)) {

                console.log(
                    "Starting watcher for:",
                    projectId
                )

                const watcher =
                    startFileWatcher(projectId)

                registerWatcher(
                    projectId,
                    watcher
                )

            }

            /*
            Check if DB is empty
            */

            const needsScan =
                await shouldRunInitialScan(
                    projectId
                )

            if (needsScan) {

                console.log(
                    "Running initial workspace scan"
                )

                await initialWorkspaceScan(
                    projectId
                )

                socket.send(
                    JSON.stringify({
                        type: "workspace_synced"
                    })
                )

            }
            const exec = await container.exec({
                Cmd: ["bash"],
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true
            })

            const stream = await exec.start({
                hijack: true,
                stdin: true
            })

            /*
            CRITICAL:
            Set a default size immediately.
            Otherwise terminal starts width=1.
            */

            await exec.resize({
                h: 30,
                w: 120
            })

            let devPortBuffer = ""

            stream.on("data", async (chunk: Buffer) => {

                // Send RAW binary
                socket.send(chunk)

                // Text parsing for localhost detection
                const text = chunk.toString("utf-8")

                devPortBuffer += text

                await detectDevPort(
                    projectId,
                    devPortBuffer
                )

                if (
                    previewReadyMap.get(projectId) &&
                    !previewPrintedMap.get(projectId)
                ) {

                    const previewURL =
                        `http://${projectId}.preview.localhost:4000`

                    socket.send(
                        `\nPreview: ${previewURL}\n`
                    )

                    previewPrintedMap.set(
                        projectId,
                        true
                    )

                    devPortBuffer = ""
                }

            })
            socket.on("message", async (msg) => {

                try {

                    const parsed =
                        JSON.parse(msg.toString())

                    if (parsed.type === "resize") {

                        await exec.resize({
                            h: parsed.rows,
                            w: parsed.cols
                        })

                        return

                    }

                } catch {
                    // Not JSON → normal input
                }

                stream.write(msg)
                lastUsedMap.set(projectId, Date.now())
            })

            socket.on("close", () => {
                try {
                    stream.end()
                } catch (err) {
                    console.error("Error ending stream on WS close: ", err)
                }

                console.log("WS disconnected")
            })

        } catch (err) {
            console.error("Terminal error: ", err)
            socket.close()
        }
    }
    )
}

export function handleUpgrade(
    req: any,
    socket: any,
    head: any
): boolean {

    const url = req.url || ""
    const host = req.headers.host || ""

    if (url.startsWith("/terminal")) {

        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req)
        })

        return true
    }

    if (host.includes(".preview.localhost")) {

        const projectId = host.split(".")[0]
        const runtime = runtimeMap.get(projectId)

        if (!runtime || !runtime.host || runtime.port === 0) {

            console.log("WS runtime not ready: ", projectId)
            socket.destroy()
            return true
        }

        lastUsedMap.set(projectId, Date.now())

        proxy.ws(req, socket, head, {
            target: `http://${runtime.host}:${runtime.port}`,
            changeOrigin: true
        })

        return true
    }

    return false
}