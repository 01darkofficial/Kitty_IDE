"use client"

import { useEffect, useState } from "react"

type Log = {
    type: "log" | "warn" | "error"
    args: any[]
}

export default function ConsolePanel() {

    const [logs, setLogs] = useState<Log[]>([])

    useEffect(() => {

        const handler = (event: MessageEvent) => {

            if (event.data?.source !== "ide-console") return

            setLogs(prev => [
                ...prev,
                {
                    type: event.data.type,
                    args: event.data.args
                }
            ])
        }

        window.addEventListener("message", handler)

        return () => window.removeEventListener("message", handler)

    }, [])

    return (

        <div className="h-40 bg-zinc-950 border-t border-zinc-800 overflow-auto text-sm p-2 font-mono">

            {logs.map((log, i) => (
                <div
                    key={i}
                    className={
                        log.type === "error"
                            ? "text-red-400"
                            : log.type === "warn"
                                ? "text-yellow-400"
                                : "text-zinc-300"
                    }
                >
                    {log.args.map(a => JSON.stringify(a)).join(" ")}
                </div>
            ))}

        </div>

    )
}