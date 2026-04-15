"use client"

import { useEffect, useRef, useState } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { ClipboardAddon } from "@xterm/addon-clipboard"
// @ts-ignore: side-effect import for xterm css without type declarations
import "@xterm/xterm/css/xterm.css"
import { Terminal as TerminalIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, } from "@/components/shadcn/ui/tabs"
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
    const terminals = ["terminal-1"]

    useEffect(() => {

        if (!containerRef.current) return

        containerRef.current.innerHTML = ""

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            scrollback: 5000,
            convertEol: true,
            fontFamily: "monospace",
            theme: {
                background: "#09090b"
            },

        })

        const fitAddon = new FitAddon()
        const clipboardAddon = new ClipboardAddon()

        term.loadAddon(fitAddon)
        term.loadAddon(clipboardAddon)

        let ws: WebSocket | null = null

        term.open(containerRef.current)
        term.focus()
        termRef.current = term

        containerRef.current.addEventListener(
            "mousedown",
            () => {
                term.focus()
            }
        )

        /*
        Track selection state
        */

        let hasSelection = false

        term.onSelectionChange(() => {
            hasSelection = term.getSelection().length > 0
        })


        term.attachCustomKeyEventHandler((event) => {
            if (
                event.ctrlKey &&
                !event.shiftKey &&
                event.key.toLowerCase() === "c"
            ) {

                if (hasSelection) {

                    const selection = term.getSelection()

                    if (selection.length > 0) {

                        navigator.clipboard.writeText(
                            selection
                        )

                        term.clearSelection()

                        return false
                        // Block SIGINT

                    }

                }

                return true

            }

            return true

        })

        /*
        Resize helper
        */

        function sendResize() {

            if (
                ws &&
                ws.readyState === WebSocket.OPEN
            ) {

                ws.send(JSON.stringify({

                    type: "resize",
                    cols: term.cols,
                    rows: term.rows

                }))

            }

        }

        let resizeTimeout: any

        function handleResize() {

            clearTimeout(resizeTimeout)

            resizeTimeout =
                setTimeout(() => {

                    fitAddon.fit()
                    sendResize()

                }, 120)

        }

        /*
        Connect WebSocket
        */

        function connect() {

            ws = new WebSocket(
                `ws://localhost:4000/terminal?projectId=${projectId}`
            )

            ws.binaryType = "arraybuffer"

            ws.onopen = () => {

                term.write(
                    "\r\n[connected]\r\n"
                )

                setTimeout(() => {

                    fitAddon.fit()
                    sendResize()

                }, 300)

            }

            ws.onmessage = async (e) => {

                /*
                CONTROL MESSAGE
                */

                if (typeof e.data === "string") {
                    /*
                    NORMAL TERMINAL STRING OUTPUT
                    */

                    term.write(e.data)

                    return

                }

                /*
                BINARY TERMINAL OUTPUT
                */

                const data =
                    new Uint8Array(e.data)

                term.write(data)

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

        window.addEventListener(
            "resize",
            handleResize
        )

        /*
        Terminal input → backend
        */

        term.onData(data => {

            if (
                ws &&
                ws.readyState === WebSocket.OPEN
            ) {

                ws.send(data)

            }

        })

        return () => {

            window.removeEventListener(
                "resize",
                handleResize
            )

            ws?.close()

            term.dispose()

        }

    }, [projectId])

    return (

        <div className="h-55 border-t border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden">

            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-2">

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >

                    <TabsList className="h-9 bg-transparent rounded-none p-0 gap-1">

                        <TabsTrigger
                            value="problems"
                            className="rounded-none px-3 h-full text-xs data-[state=active]:bg-zinc-800"
                        >
                            Problems
                        </TabsTrigger>

                        <TabsTrigger
                            value="debug"
                            className="rounded-none px-3 h-full text-xs data-[state=active]:bg-zinc-800"
                        >
                            Debug
                        </TabsTrigger>

                        <TabsTrigger
                            value="terminal"
                            className="rounded-none px-3 h-full text-xs flex items-center gap-2 data-[state=active]:bg-zinc-800"
                        >
                            <TerminalIcon className="w-4 h-4" />
                            Terminal
                        </TabsTrigger>

                    </TabsList>

                </Tabs>

            </div>

            <div className="flex flex-1 overflow-hidden">

                <div className="flex-1 relative overflow-hidden bg-zinc-950">

                    <div
                        ref={containerRef}
                        tabIndex={0}
                        className={`h-full w-full ${activeTab === "terminal"
                            ? "block"
                            : "hidden"
                            }`}
                    />

                </div>

                <div className="w-55 border-l border-zinc-800 bg-zinc-950 flex flex-col">

                    <div className="flex flex-col gap-1">

                        {terminals.map((name) => (

                            <Button
                                key={name}
                                variant="ghost"
                                onClick={() =>
                                    setActiveTerminal(name)
                                }
                                className={
                                    `justify-start text-xs rounded-none h-8 px-2 ` +
                                    (activeTerminal === name
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-400 hover:bg-zinc-800/50")
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