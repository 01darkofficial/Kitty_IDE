import http from "http"
import app from "../app"
import { handlePreviewRequest } from "./previewProxy"
import { httpServerLogger } from "../utils/logger"


/**
 * Creates the main HTTP server.
 *
 * Routing:
 * - *.preview.localhost → preview proxy
 * - localhost:*         → main app
 * - otherwise           → 404
 */
export function createHTTPServer(): http.Server {

    return http.createServer(async (req, res) => {

        const host = req.headers.host || ""
        const hostname = host.split(":")[0]

        /*
        Preview routing
        */

        if (hostname.endsWith(".preview.localhost")) {

            httpServerLogger.kittyDebug("Preview route: ", { host, url: req.url, method: req.method })

            try {
                if (await handlePreviewRequest(req, res)) {
                    return
                }
            }
            catch (err) {
                httpServerLogger.kittyError("Preview handler failed: ", { host, url: req.url, err })

                res.writeHead(500)
                res.end("Preview error")

                return
            }
        }

        /*
        Main app routing
        */

        if (host === "localhost:4000" || host.startsWith("localhost:")) {
            httpServerLogger.kittyDebug("App route: ", { host, url: req.url, method: req.method })
            return app(req, res)
        }

        /*
        Unknown host
        */

        httpServerLogger.kittyWarn("Invalid host: ", { host, url: req.url })

        res.writeHead(404)
        res.end("Invalid host")
    }
    )
}