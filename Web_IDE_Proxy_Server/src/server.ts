import http from "http"
import httpProxy from "http-proxy"
import { WebSocketServer } from "ws"
import app from "./app"
import { runtimeMap } from "./runtime/runtimeMap"
import { lastUsedMap } from "./runtime/activity"
import { startCleanupLoop } from "./runtime/cleanup"
import docker from "./runtime/docker"

const proxy = httpProxy.createProxyServer({})

// -------------------
// proxy error handling
// -------------------
proxy.on("error", (err, req, res) => {
    console.error("Proxy error:", err.message)

    if ("writeHead" in res) {
        const r = res as any
        if (!r.headersSent) {
            r.writeHead(502, { "Content-Type": "text/plain" })
        }
        r.end("Proxy error")
    }
})

// -------------------
// create server
// -------------------
const server = http.createServer((req, res) => {

    const host = req.headers.host || ""

    // -------------------------
    // API requests → Express
    // -------------------------
    if (
        host === "localhost:4000" ||
        host.startsWith("localhost:")
    ) {
        return app(req, res)
    }

    // -------------------------
    // Preview requests → Proxy
    // -------------------------
    if (host.includes(".preview.localhost")) {

        const projectId = host.split(".")[0]
        const port = runtimeMap.get(projectId)

        console.log("runtimeMap:", runtimeMap)

        console.log("Preview request:", projectId, "→", port)

        lastUsedMap.set(projectId, Date.now())

        if (!port) {
            res.writeHead(404)
            res.end("Container not running")
            return
        }

        proxy.web(req, res, {
            target: `http://localhost:${port}`,
            changeOrigin: true
        })

        return
    }

    // fallback
    res.writeHead(404)
    res.end("Invalid host")
})

const wss = new WebSocketServer({ noServer: true })

wss.on("connection", async (socket, req) => {

    console.log("WS connected")

    try {
        const url = new URL(req.url!, "http://localhost")
        const projectId = url.searchParams.get("projectId")

        if (!projectId) {
            socket.close()
            return
        }

        const containerName = `project-${projectId}`
        const container = docker.getContainer(containerName)

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

        stream.on("data", (chunk: Buffer) => {

            // Docker multiplexed stream header = 8 bytes
            if (chunk.length > 8) {
                const payload = chunk.slice(8) // remove header
                socket.send(payload.toString("utf-8"))
            }
        })

        socket.on("message", (msg) => {
            console.log("incoming:", msg.toString())
            const data = msg.toString()
            stream.write(data)
        })

        socket.on("close", () => {
            stream.end()
            console.log("WS disconnected")
        })

    } catch (err) {
        console.error("Terminal error:", err)
        socket.close()
    }
})

// -------------------
// websocket support
// -------------------
server.on("upgrade", (req, socket, head) => {

    const url = req.url || ""
    const host = req.headers.host || ""

    // ✅ 1. Terminal route
    if (url.startsWith("/terminal")) {

        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req)
        })

        return
    }

    // ✅ 2. Preview (existing logic)
    if (host.includes(".preview.localhost")) {

        const projectId = host.split(".")[0]
        const port = runtimeMap.get(projectId)

        if (!port) {
            socket.destroy()
            return
        }

        proxy.ws(req, socket, head, {
            target: `http://localhost:${port}`,
            changeOrigin: true
        })

        return
    }

    // fallback
    socket.destroy()
})

startCleanupLoop()

server.listen(4000, () => {
    console.log("Proxy running on http://localhost:4000")
})