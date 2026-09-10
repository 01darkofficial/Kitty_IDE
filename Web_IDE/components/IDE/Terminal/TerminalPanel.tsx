"use client"

import { useEffect, useRef, useState } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { ClipboardAddon } from "@xterm/addon-clipboard"
// @ts-ignore: side-effect import for xterm css without type declarations
import "@xterm/xterm/css/xterm.css"
import { ChevronDown, Terminal as TerminalIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shadcn/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, } from "@/components/shadcn/ui/tabs"
import { terminalUILogger } from "@/utils/logger"
import { useTerminalStore } from "@/store/terminalStore"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { cn } from "@/lib/utils"

interface TerminalPanelProps {
    projectId: string
}

/**
 * Terminal UI panel.
 *
 * Responsibilities:
 * - Initialize xterm instance
 * - Maintain WebSocket session
 * - Handle resize synchronization
 * - Forward terminal input/output
 */
export default function TerminalPanel({ projectId }: TerminalPanelProps) {

    const containerRef = useRef<HTMLDivElement | null>(null)
    const termRef = useRef<Terminal | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)

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

    const terminalTabClass = `relative h-full rounded-none border-b-2 border-transparent bg-transparent px-3 text-xs font-medium !text-neutral-400 transition-fast hover:bg-neutral-900/30 hover:!text-neutral-0 data-[state=active]:border-neutral-0 data-[state=active]:bg-neutral-900/20 data-[state=active]:!text-neutral-0 data-[state=active]:shadow-none`

    const { terminalOpen, terminalHeight, mobileWorkspace } = useWorkspaceStore()

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
        fitAddonRef.current = fitAddon
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

    useEffect(() => {
        if (terminalOpen || mobileWorkspace === "terminal") {
            requestAnimationFrame(() => {
                fitAddonRef.current?.fit()
            })
        }
    }, [terminalOpen, terminalHeight, mobileWorkspace]);

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden border-zinc-800 bg-zinc-950">
            <div className="flex h-9 shrink-0 items-center border-b border-zinc-800 bg-zinc-900">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="h-full"
                >
                    <TabsList className="h-full gap-0 rounded-none bg-transparent p-0">
                        <TabsTrigger value="problems" className={terminalTabClass}>
                            Problems
                        </TabsTrigger>

                        <TabsTrigger value="debug" className={terminalTabClass}>
                            Debug
                        </TabsTrigger>

                        <TabsTrigger value="terminal" className={`${terminalTabClass} flex items-center gap-2`}>
                            <TerminalIcon className="h-3.5 w-3.5" />
                            Terminal
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden">
                <div className="min-w-0 flex-1 overflow-hidden bg-zinc-950">
                    <div
                        ref={containerRef}
                        tabIndex={0}
                        className={cn("h-full w-full outline-none",
                            activeTab === "terminal" ? "block" : "hidden"
                        )}
                    />
                </div>

                <aside className="flex h-full min-h-0 w-52 shrink-0 flex-col border-l border-zinc-800 bg-zinc-900">
                    <div className="flex h-9 items-center justify-between border-b border-zinc-800 px-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Terminals
                        </span>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
                        {terminals.map((terminal) => {
                            const previews = terminal.previews ?? [];

                            return (
                                <div
                                    key={terminal.id}
                                    className={cn("group flex h-8 items-center gap-2 rounded px-2",
                                        activeTerminalId === terminal.id ? "bg-zinc-800" : "hover:bg-zinc-800/60"
                                    )}
                                >
                                    <button
                                        onClick={() => setActiveTerminal(terminal.id)}
                                        className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs"
                                    >

                                        <span
                                            className={cn("h-1.5 w-1.5 shrink-0 rounded-full",
                                                terminal.connected ? "bg-emerald-500" : "bg-zinc-600"

                                            )}
                                        />

                                        <span className="truncate text-zinc-300">
                                            {terminal.name}
                                        </span>
                                    </button>

                                    {previews.length === 1 && (

                                        <button
                                            onClick={() =>
                                                window.open(previews[0].url, "_blank", "noopener,noreferrer")
                                            }
                                            className="shrink-0 text-[11px] text-emerald-400 hover:text-emerald-300"
                                        >
                                            Preview
                                        </button>

                                    )}

                                    {previews.length > 1 && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex shrink-0 items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300">
                                                    Preview
                                                    <ChevronDown size={12} />
                                                </button>

                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end" className="w-44"  >
                                                {previews.map((preview) => (
                                                    <DropdownMenuItem
                                                        key={preview.id}
                                                        onClick={() =>
                                                            window.open(preview.url, "_blank", "noopener,noreferrer")
                                                        }
                                                    >
                                                        {preview.name}
                                                    </DropdownMenuItem>

                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </aside>
            </div>
        </div>
    )
}