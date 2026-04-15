import httpProxy from "http-proxy"
import { runtimeMap } from "../runtime/runtimeMap"
import { lastUsedMap } from "../runtime/activity"
import fs from "fs"
import path from "path"

const errorTemplate = fs.readFileSync(
    path.join(
        __dirname,
        "../templates/previewError.html"
    ),
    "utf-8"
)

export const proxy = httpProxy.createProxyServer({ ws: true })

proxy.on("error", (err, req, res) => {

    console.error(
        "Proxy error:",
        err.message
    )

    if (!res || !("writeHead" in res)) {
        return
    }

    const r = res as any

    if (r.headersSent) {
        return
    }

    r.writeHead(502, {
        "Content-Type": "text/html"
    })

    const html = errorTemplate.replace("{{ERROR_MESSAGE}}", err.message)
    r.end(html)

})

export function handlePreviewRequest(
    req: any,
    res: any
): boolean {

    const host = req.headers.host || ""

    console.log("Preview host:", host)

    if (!host.includes(".preview.localhost")) {
        return false
    }

    const projectId = host.split(".")[0]

    console.log("Preview projectId:", projectId)

    const runtime = runtimeMap.get(projectId)

    if (!runtime || runtime.port === 0) {

        res.writeHead(503, {
            "Content-Type": "text/html"
        })

        res.end(`
        <h2>Preview not ready</h2>
        <p>
        Start the development server
        inside the terminal.
        </p>
    `)

        return true
    }

    lastUsedMap.set(projectId, Date.now())

    const target = `http://${runtime.host}:${runtime.port}`

    console.log("Proxy target: ", target)

    proxy.web(req, res, {
        target,
        changeOrigin: true
    })

    return true
}