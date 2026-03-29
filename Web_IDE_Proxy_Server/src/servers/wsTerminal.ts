import { WebSocketServer } from "ws"
import { ensureContainerRunning } from "../runtime/ensureContainerRunning"
import { detectDevPort } from "../runtime/detectDevPort"
import { previewPrintedMap, previewReadyMap, runtimeMap } from "../runtime/runtimeMap"
import { proxy } from "./previewProxy"
import { lastUsedMap } from "../runtime/activity"

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

            const container = await ensureContainerRunning(projectId)

            const exec = await container.exec({
                Cmd: ["sh", "-i"],
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true
            })

            const stream = await exec.start({
                hijack: true,
                stdin: true
            })

            let devPortBuffer = "";
            stream.on("data", async (chunk: Buffer) => {

                if (chunk.length <= 8) return

                const payload = chunk.subarray(8)

                const text = payload.toString("utf-8")

                if (text.includes("localhost")) {
                    console.log("Detected output: ", text)
                }

                // Always send raw output
                socket.send(text)

                // -------------------------
                // Buffer for detection
                // -------------------------

                devPortBuffer += text

                await detectDevPort(projectId, devPortBuffer)

                // -------------------------
                // Print preview link once
                // -------------------------

                if (
                    previewReadyMap.get(projectId) &&
                    !previewPrintedMap.get(projectId)
                ) {

                    const previewURL = `http://${projectId}.preview.localhost:4000`

                    console.log("Preview link generated:", previewURL
                    )

                    socket.send(`\nPreview: ${previewURL}\n`)

                    previewPrintedMap.set(projectId, true)

                    devPortBuffer = ""
                }

            })

            socket.on("message", (msg) => {
                stream.write(msg.toString())
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