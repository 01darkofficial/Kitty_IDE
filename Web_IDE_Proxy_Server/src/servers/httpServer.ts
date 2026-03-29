import http from "http"
import app from "../app"
import { handlePreviewRequest } from "./previewProxy"

export function createHTTPServer(): http.Server {

    return http.createServer((req, res) => {

        const host = req.headers.host || ""

        // -------------------------
        // Preview routing
        // -------------------------

        if (host.includes(".preview.localhost")) {
            console.log("Preview request:", req.url)

            if (handlePreviewRequest(req, res)) {
                return
            }

        }

        // -------------------------
        // Main API/App
        // -------------------------

        if (host === "localhost:4000" || host.startsWith("localhost:")) {
            return app(req, res)
        }

        res.writeHead(404)
        res.end("Invalid host")

    })
}