import { useEffect } from "react"
import { useRuntimeStore } from "@/store/runtimeStore"

export function useNodeKeepAlive(
    projectId: string,
    runtime: string
) {

    const setReady =
        useRuntimeStore(s => s.setReady)

    useEffect(() => {

        if (runtime !== "node") {

            setReady(true)
            return

        }

        let keepAliveInterval:
            NodeJS.Timeout | null = null

        let cancelled = false

        async function pingUntilReady() {

            if (cancelled) return

            try {

                const res =
                    await fetch(
                        "http://localhost:4000/ping",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                projectId
                            })
                        }
                    )

                if (res.ok) {

                    setReady(true)

                    // Start keepalive
                    keepAliveInterval =
                        setInterval(
                            pingRuntime,
                            10000
                        )

                    return

                }

            }

            catch { }

            // Retry until ready
            setTimeout(
                pingUntilReady,
                1000
            )

        }

        async function pingRuntime() {

            try {

                await fetch(
                    "http://localhost:4000/ping",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            projectId
                        })
                    }
                )

            }

            catch {

                // Runtime lost
                setReady(false)

            }

        }

        pingUntilReady()

        return () => {

            cancelled = true

            if (keepAliveInterval)
                clearInterval(
                    keepAliveInterval
                )

            setReady(false)

        }

    }, [projectId, runtime])

}