import httpProxy from "http-proxy"
import { runtimeMap } from "../runtime/runtimeMap"
import { lastUsedMap } from "../runtime/activity"
import fs from "fs"
import path from "path"
import { previewProxyLogger } from "../utils/logger"

/**
 * Preview proxy.
 *
 * Routes:
 *   <projectId>.preview.localhost
 * → project runtime container.
 */

const errorTemplate = fs.readFileSync(path.join(__dirname, "../templates/previewError.html"), "utf-8")

/**
 * Shared HTTP/WebSocket proxy instance.
 */
export const proxy = httpProxy.createProxyServer({ ws: true })

/*
Proxy-level transport failures.
*/

proxy.on("error", (err, req, res) => {

    previewProxyLogger.kittyError("Proxy transport error: ", { message: err.message })

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

    const html = errorTemplate.replace(
        "{{ERROR_MESSAGE}}",
        err.message
    )

    r.end(html)

})

/**
 * Handles preview HTTP requests.
 *
 * Returns:
 *   true  → request handled
 *   false → not a preview route
 */
export async function handlePreviewRequest(
    req: any,
    res: any
): Promise<boolean> {

    const host = req.headers.host || ""

    const hostname = host.split(":")[0]

    // Validate preview domain

    if (!hostname.endsWith(".preview.localhost")) {
        return false
    }


    const projectId = hostname.replace(".preview.localhost", "")

    previewProxyLogger.kittyDebug("Preview request: ", { projectId })

    const runtime = await waitForRuntime(projectId)

    if (!runtime) {

        previewProxyLogger.kittyWarn("Runtime unavailable: ", { projectId })

        res.writeHead(503, {
            "Content-Type": "text/html"
        })

        res.end(`
            <h2>Preview not ready</h2>
            <p>Dev server did not start.</p>
        `)

        return true
    }

    lastUsedMap.set(projectId, Date.now())

    const target = `http://${runtime.host}:${runtime.port}`

    previewProxyLogger.kittyDebug("Proxy target resolved: ", { projectId, port: runtime.port })

    proxy.web(req, res, {
        target,
        changeOrigin: true
    })

    return true
}

/**
 * Waits until runtime port becomes available.
 *
 * Polls runtimeMap until:
 * - port detected
 * - timeout reached
 */
async function waitForRuntime(
    projectId: string
) {

    const timeout = 10000
    const interval = 100

    const start = Date.now()

    previewProxyLogger.kittyDebug("Waiting for runtime: ", { projectId })

    while (Date.now() - start < timeout) {

        const runtime = runtimeMap.get(projectId)

        if (runtime && runtime.port && runtime.port !== 0) {
            previewProxyLogger.kittyDebug("Runtime ready: ", { projectId, port: runtime.port })
            return runtime
        }

        await new Promise(
            r => setTimeout(r, interval)
        )
    }

    previewProxyLogger.kittyWarn("Runtime wait timeout: ", { projectId })

    return null
}