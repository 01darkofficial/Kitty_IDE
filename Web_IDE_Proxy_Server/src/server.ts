import http from "http"
import httpProxy from "http-proxy"
import app from "./app"
import { runtimeMap } from "./runtime/runtimeMap"
import { lastUsedMap } from "./runtime/activity"
import { startCleanupLoop } from "./runtime/cleanup"

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

// -------------------
// websocket support
// -------------------
server.on("upgrade", (req, socket, head) => {

    const host = req.headers.host || ""
    const projectId = host.split(".")[0]

    const port = runtimeMap.get(projectId)

    if (!port) {
        socket.destroy()
        return
    }

    proxy.ws(req, socket, head, {
        target: `http://localhost:${port}`
    })
})

startCleanupLoop()

server.listen(4000, () => {
    console.log("Proxy running on http://localhost:4000")
})