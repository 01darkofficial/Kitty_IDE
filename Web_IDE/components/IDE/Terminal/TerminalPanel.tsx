"use client"

import { useEffect, useRef, useState } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"

import { Terminal as TerminalIcon } from "lucide-react"

import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/shadcn/ui/tabs"

import { Button } from "@/components/shadcn/ui/button"

export default function TerminalPanel({
    projectId
}: {
    projectId: string
}) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const termRef = useRef<Terminal | null>(null)

    const [activeTab, setActiveTab] = useState("terminal")

    const [activeTerminal, setActiveTerminal] = useState("terminal-1")

    const terminals = [
        "terminal-1"
    ]

    useEffect(() => {
        if (!containerRef.current) return

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            scrollback: 2000,
            theme: {
                background: "#09090b" // zinc-900
            }
        })

        const fitAddon = new FitAddon()

        term.loadAddon(fitAddon)

        term.open(containerRef.current)

        setTimeout(() => {
            fitAddon.fit()
        }, 0)

        termRef.current = term

        let ws: WebSocket | null = null

        function connect() {
            ws = new WebSocket(
                `ws://localhost:4000/terminal?projectId=${projectId}`
            )

            ws.onopen = () => {
                term.write("\r\n[connected]\r\n")
                ws!.send("\n")
            }

            ws.onmessage = e => {
                term.write(e.data)
            }

            ws.onclose = () => {
                term.write(
                    "\r\n[disconnected... reconnecting]\r\n"
                )

                setTimeout(connect, 1000)
            }

            ws.onerror = () => {
                ws?.close()
            }
        }

        connect()

        term.onData(data => {
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
        <div className="h-55 border-t border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden">

            {/* TOP BAR */}

            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-2">

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >

                    <TabsList className="h-9 bg-transparent rounded-none p-0 gap-1">

                        <TabsTrigger
                            value="problems"
                            className="rounded-none px-3 h-full text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                        >
                            Problems
                        </TabsTrigger>

                        <TabsTrigger
                            value="debug"
                            className="rounded-none px-3 h-full text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                        >
                            Debug
                        </TabsTrigger>

                        <TabsTrigger
                            value="terminal"
                            className="rounded-none px-3 h-full text-xs flex items-center gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                        >
                            <TerminalIcon className="w-4 h-4" />
                            Terminal
                        </TabsTrigger>

                    </TabsList>

                </Tabs>

            </div>

            {/* BODY */}

            <div className="flex flex-1 overflow-hidden">

                {/* CONTENT AREA */}

                <div className="flex-1 relative overflow-hidden bg-zinc-950">

                    <div
                        ref={containerRef}
                        className={`h-full w-full ${activeTab === "terminal"
                            ? "block"
                            : "hidden"
                            }`}
                    />

                    {activeTab === "problems" && (
                        <div className="h-full w-full p-4 text-sm text-zinc-400">
                            Problems panel (placeholder)
                        </div>
                    )}

                    {activeTab === "debug" && (
                        <div className="h-full w-full p-4 text-sm text-zinc-400">
                            Debug panel (placeholder)
                        </div>
                    )}

                </div>

                {/* RIGHT BAR */}

                <div className="w-55 border-l border-zinc-800 bg-zinc-950 flex flex-col">

                    <div className="flex flex-col gap-1">

                        {terminals.map((name) => (
                            <Button
                                key={name}
                                variant="ghost"
                                onClick={() => setActiveTerminal(name)}
                                className={
                                    `justify-start text-xs rounded-none h-8 px-2 ` +
                                    (activeTerminal === name
                                        ? "bg-zinc-900 text-white border-b border-zinc-800"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")
                                }
                            >
                                {name}
                            </Button>
                        ))}

                    </div>

                </div>


            </div>

        </div>
    )
}