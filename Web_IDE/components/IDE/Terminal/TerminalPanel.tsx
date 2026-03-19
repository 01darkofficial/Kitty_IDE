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

        // connect WS
        const ws = new WebSocket(
            `ws://localhost:4000/terminal?projectId=${projectId}`
        )

        ws.onopen = () => {
            term.write("Connected to terminal\r\n")
            ws.send("\n") // 🔥 force shell to respond
        }

        // 🔥 IMPORTANT: write raw data
        ws.onmessage = (e) => {
            term.write(e.data)
        }

        term.onData((data) => {
            ws.send(data)
        })

        ws.onclose = () => {
            term.write("\r\n[disconnected]\r\n")
        }

        return () => {
            ws.close()
            term.dispose()
        }
    }, [projectId])

    return (
        <div className="h-50 w-full bg-black">
            <div ref={containerRef} className="h-full w-full" />
        </div>
    )
}