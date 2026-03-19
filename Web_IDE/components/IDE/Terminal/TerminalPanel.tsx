"use client"

import { useEffect, useRef } from "react"
import { Terminal } from "@xterm/xterm"
import "@xterm/xterm/css/xterm.css"

export default function TerminalPanel({ projectId }: { projectId: string }) {
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            theme: {
                background: "#0a0a0a"
            }
        })

        term.open(containerRef.current)

        let ws: WebSocket | null = null

        function connect() {

            ws = new WebSocket(
                `ws://localhost:4000/terminal?projectId=${projectId}`
            )

            ws.onopen = () => {
                term.write("\r\n[connected]\r\n")
                ws!.send("\n")
            }

            ws.onmessage = (e) => {
                term.write(e.data)
            }

            ws.onclose = () => {
                term.write("\r\n[disconnected... reconnecting]\r\n")

                setTimeout(() => {
                    connect() // 🔥 reconnect
                }, 1000)
            }

            ws.onerror = () => {
                ws?.close()
            }
        }

        connect()

        // input → backend
        term.onData((data) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                if (data === "\r") {
                    ws.send("\n")
                } else {
                    ws.send(data)
                }
            }
        })

        return () => {
            ws?.close()
            term.dispose()
        }

    }, [projectId])

    return (
        <div className="h-50 w-full bg-black">
            <div ref={containerRef} className="h-full w-full" />
        </div>
    )
}