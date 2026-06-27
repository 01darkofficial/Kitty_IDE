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
import { terminalUILogger } from "@/utils/logger"
import { useTerminalStore } from "@/store/terminalStore"

/**
 * Terminal UI panel.
 *
 * Responsibilities:
 * - Initialize xterm instance
 * - Maintain WebSocket session
 * - Handle resize synchronization
 * - Forward terminal input/output
 */
export default function TerminalPanel({
    projectId
}: {
    projectId: string
}) {

    const containerRef = useRef<HTMLDivElement | null>(null)
    const termRef = useRef<Terminal | null>(null)
    const [activeTab, setActiveTab] = useState("terminal")
    const initializedRef = useRef(false)
    const isRealUnmountRef = useRef(false)
    const addTerminal = useTerminalStore(s => s.addTerminal)
    const setActiveTerminal = useTerminalStore(s => s.setActiveTerminal)
    const terminalsMap = useTerminalStore(s => s.terminals)
    const terminals = Object.values(terminalsMap)
    const activeTerminalId = useTerminalStore(s => s.activeTerminalId)
    const addPreview = useTerminalStore(s => s.addPreview)
    const removePreview = useTerminalStore(s => s.removePreview)

    useEffect(() => {
        if (terminalsMap["terminal-1"]) {
            return
        }

        addTerminal({
            id: "terminal-1",
            name: "terminal-1",
            connected: false,
            previews: []
        })

        setActiveTerminal("terminal-1")
    }, [])

    // Component mount
    useEffect(() => {
        terminalUILogger.kittyDebug("Terminal mounted:", { projectId })
    }, [])

    // Terminal initialization

    useEffect(() => {
        if (initializedRef.current) {
            return
        }

        initializedRef.current = true

        if (!containerRef.current) return

        containerRef.current.innerHTML = ""

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            scrollback: 5000,
            convertEol: true,
            fontFamily: "monospace",
            theme: { background: "#09090b" }
        })

        const fitAddon = new FitAddon()
        const clipboardAddon = new ClipboardAddon()

        term.loadAddon(fitAddon)
        term.loadAddon(clipboardAddon)

        let ws: WebSocket | null = null
        let isUnmounting = false

        term.open(containerRef.current)
        term.focus()
        termRef.current = term

        containerRef.current.addEventListener("mousedown", () => term.focus())
        let hasSelection = false

        term.onSelectionChange(() => {
            hasSelection = term.getSelection().length > 0
        })

        term.attachCustomKeyEventHandler((event) => {
            if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === "c") {
                if (hasSelection) {
                    const selection = term.getSelection()
                    if (selection.length > 0) {
                        navigator.clipboard.writeText(selection)
                        term.clearSelection()
                        return false
                    }
                }
                return true
            }
            return true
        })

        // Resize sync
        function sendResize() {
            if (ws && ws.readyState === WebSocket.OPEN) {
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

            resizeTimeout = setTimeout(() => {
                fitAddon.fit()
                sendResize()
            }, 120)
        }

        // WebSocket connection
        function connect() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                return
            }

            ws = new WebSocket(`ws://localhost:4000/terminal?projectId=${projectId}`)
            ws.binaryType = "arraybuffer"

            ws.onopen = () => {
                terminalUILogger.kittyLog("Terminal connected: ", { projectId })
                term.write("\r\n[connected]\r\n")

                setTimeout(() => {
                    fitAddon.fit()
                    sendResize()
                }, 300)
            }

            ws.onmessage = (e) => {
                if (typeof e.data === "string") {
                    try {
                        const message = JSON.parse(e.data)

                        if (message.type === "terminal-history") {
                            term.write(message.data)
                            return
                        }

                        if (message.type === "preview-ready") {
                            const activeTerminalId = useTerminalStore.getState().activeTerminalId
                            addPreview(
                                activeTerminalId!,
                                {
                                    id: crypto.randomUUID(),
                                    port: message.port,
                                    name: "Preview",
                                    url: message.url
                                }
                            )
                            return
                        }

                        if (message.type === "preview-stopped") {
                            removePreview("terminal-1", message.port)
                            return
                        }
                    }
                    catch {
                        term.write(e.data)
                        return
                    }
                    return
                }
                const data = new Uint8Array(e.data)
                term.write(data)
            }

            ws.onclose = () => {
                if (isUnmounting) return

                terminalUILogger.kittyWarn("Terminal disconnected: ", { projectId })
                term.write("\r\n[disconnected... reconnecting]\r\n")

                setTimeout(connect, 1000)
            }

            ws.onerror = () => {
                terminalUILogger.kittyError("Terminal socket error: ", { projectId })
                ws?.close()
            }
        }

        connect()

        window.addEventListener("resize", handleResize)

        // Terminal input
        term.onData(data => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(data)
            }
        })

        // Cleanup
        return () => {
            if (!isRealUnmountRef.current) {
                isRealUnmountRef.current = true
                return
            }

            isUnmounting = true
            terminalUILogger.kittyDebug("Terminal cleanup: ", { projectId })
            window.removeEventListener("resize", handleResize)

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

                        {terminals.map((terminal) => (
                            <div
                                key={terminal.id}
                                className="flex items-center justify-between"
                            >
                                <Button
                                    key={terminal.id}
                                    variant="ghost"
                                    onClick={() =>
                                        setActiveTerminal(terminal.id)
                                    }
                                    className={
                                        `justify-start text-xs rounded-none h-8 px-2 ` +
                                        (activeTerminalId === terminal.id
                                            ? "bg-zinc-900 text-white"
                                            : "text-zinc-400 hover:bg-zinc-800/50")
                                    }
                                >
                                    {terminal.name}
                                </Button>
                                {terminal.previews.length > 0 ? (
                                    terminal.previews.length === 1 ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(
                                                terminal.previews[0].url,
                                                "_blank"
                                            )}
                                            className=" h-6 text-xs bg-emerald-900/30 border-emerald-700 text-emerald-400"
                                        >
                                            Preview
                                        </Button>
                                    ) : (
                                        <select
                                            className="h-6 text-xs bg-emerald-900/30 text-emerald-400"
                                            onChange={(e) => window.open(
                                                e.target.value,
                                                "_blank"
                                            )}
                                        >
                                            <option>
                                                Preview
                                            </option>
                                            {terminal.previews.map(
                                                (preview, i) => (
                                                    <option
                                                        key={preview.id}
                                                        value={preview.url}
                                                    >
                                                        {preview.name || `Preview ${i + 1}`}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    )
                                ) : (
                                    <Button
                                        size="sm"
                                        disabled
                                        className="h-6 text-xs"
                                    >
                                        Preview
                                    </Button>
                                )}
                            </div>
                        ))}

                    </div>

                </div>

            </div>

        </div>

    )

}