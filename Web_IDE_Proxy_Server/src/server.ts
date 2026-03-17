import http from "http"
import httpProxy from "http-proxy"

const proxy = httpProxy.createProxyServer({})
const runtimeMap = new Map<string, number>()

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

const server = http.createServer((req, res) => {

    /* container registration from IDE server */

    if (req.method === "POST" && req.url === "/register") {

        let body = ""

        req.on("data", chunk => body += chunk)

        req.on("end", () => {

            const { projectId, port } = JSON.parse(body)

            runtimeMap.set(projectId, port)

            console.log("Proxy registered:", projectId, "→", port)

            res.end("ok")
        })

        return
    }

    /* determine projectId from subdomain */

    const host = req.headers.host || ""
    const projectId = host.split(".")[0]

    const port = runtimeMap.get(projectId)

    if (!port) {
        res.writeHead(404)
        res.end("Container not running")
        return
    }

    proxy.web(req, res, {
        target: `http://localhost:${port}`,
        changeOrigin: true
    })
})

/* websocket support (vite HMR etc) */

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

server.listen(4000, () => {
    console.log("Proxy running on http://localhost:4000")
})