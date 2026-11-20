"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { ClipboardAddon } from "@xterm/addon-clipboard"
// @ts-ignore: side-effect import for xterm css without type declarations
import "@xterm/xterm/css/xterm.css"
import { AlertCircle, AlertTriangle, ChevronDown, Info, Terminal as TerminalIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shadcn/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, } from "@/components/shadcn/ui/tabs"
import { terminalUILogger } from "@/utils/logger"
import { useTerminalStore } from "@/store/terminalStore"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { cn } from "@/lib/utils"
import { onDiagnostics } from "@/lib/lsp/client"
import type { LspDiagnostic, PublishDiagnosticsParams } from "@/types/lsp"

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
    const [diagnosticsByUri, setDiagnosticsByUri] = useState<Record<string, LspDiagnostic[]>>({})
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
        setDiagnosticsByUri({})
        const projectUriPrefix = `file:///var/lib/cloud-ide/projects/${projectId}/`

        return onDiagnostics(({ uri, diagnostics }: PublishDiagnosticsParams) => {
            if (!uri.startsWith(projectUriPrefix)) return

            setDiagnosticsByUri((current) => {
                const next = { ...current }
                if (diagnostics.length === 0) delete next[uri]
                else next[uri] = diagnostics
                return next
            })
        })
    }, [projectId])

    const problems = useMemo(() =>
        Object.entries(diagnosticsByUri)
            .flatMap(([uri, diagnostics]) => diagnostics.map((diagnostic) => ({ uri, diagnostic })))
            .sort((a, b) => (a.diagnostic.severity ?? 1) - (b.diagnostic.severity ?? 1) ||
                a.uri.localeCompare(b.uri) ||
                a.diagnostic.range.start.line - b.diagnostic.range.start.line),
        [diagnosticsByUri],
    )

    const errorCount = problems.filter(({ diagnostic }) => (diagnostic.severity ?? 1) === 1).length
    const warningCount = problems.filter(({ diagnostic }) => diagnostic.severity === 2).length

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
        if (activeTab === "terminal" && (terminalOpen || mobileWorkspace === "terminal")) {
            requestAnimationFrame(() => {
                fitAddonRef.current?.fit()
            })
        }
    }, [activeTab, terminalOpen, terminalHeight, mobileWorkspace]);

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
                            {problems.length > 0 && (
                                <span className="ml-1 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] leading-none text-zinc-200">
                                    {problems.length}
                                </span>
                            )}
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

            <div className={cn("min-h-0 flex-1 overflow-hidden", activeTab === "terminal" ? "flex" : "hidden")}>
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

            {activeTab === "problems" && (
                <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-950 text-zinc-300">
                    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 bg-zinc-950 px-4 py-2 text-xs">
                        <span className="font-medium text-zinc-200">
                            {problems.length === 0 ? "No problems detected" : `${problems.length} ${problems.length === 1 ? "problem" : "problems"}`}
                        </span>
                        {errorCount > 0 && <span className="inline-flex items-center gap-1.5 text-red-300"><AlertCircle size={13} />{errorCount} {errorCount === 1 ? "error" : "errors"}</span>}
                        {warningCount > 0 && <span className="inline-flex items-center gap-1.5 text-amber-300"><AlertTriangle size={13} />{warningCount} {warningCount === 1 ? "warning" : "warnings"}</span>}
                    </div>

                    {problems.length === 0 ? (
                        <div className="flex h-36 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-zinc-500">
                            <Info size={18} />
                            <p>Language server diagnostics will appear here as you edit files.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-zinc-900">
                            {problems.map(({ uri, diagnostic }, index) => {
                                const prefix = `file:///var/lib/cloud-ide/projects/${projectId}/`
                                const encodedPath = uri.startsWith(prefix) ? uri.slice(prefix.length) : uri
                                let filePath = encodedPath
                                try {
                                    filePath = decodeURIComponent(encodedPath)
                                } catch {
                                    // Keep the LSP-provided path if it contains malformed escaping.
                                }
                                const severity = diagnostic.severity ?? 1
                                const SeverityIcon = severity === 1 ? AlertCircle : severity === 2 ? AlertTriangle : Info
                                const severityClass = severity === 1 ? "text-red-400" : severity === 2 ? "text-amber-300" : "text-sky-300"
                                const line = diagnostic.range.start.line + 1
                                const column = diagnostic.range.start.character + 1

                                return (
                                    <li key={`${uri}:${line}:${column}:${diagnostic.code ?? ""}:${index}`}>
                                        <div className="flex min-w-0 items-start gap-3 px-4 py-3">
                                            <SeverityIcon size={15} className={`mt-0.5 shrink-0 ${severityClass}`} />
                                            <div className="min-w-0 flex-1">
                                                <p className="wrap-break text-sm text-zinc-200">{diagnostic.message}</p>
                                                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500">
                                                    <span className="break-all">{filePath}</span>
                                                    <span>Ln {line}, Col {column}</span>
                                                    {diagnostic.source && <span>{diagnostic.source}</span>}
                                                    {diagnostic.code !== undefined && <span>{diagnostic.code}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            )}

            {activeTab === "debug" && (
                <div className="flex min-h-0 flex-1 items-center justify-center bg-zinc-950 px-4 text-center text-sm text-zinc-500">
                    Debug console is not connected.
                </div>
            )}
        </div>
    )
}
