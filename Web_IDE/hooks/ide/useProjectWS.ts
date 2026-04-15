import { useEffect } from "react"
import { useFileStore } from "@/store/fileStore"
import { useRuntimeStore } from "@/store/runtimeStore"
import {
    connectProjectWS,
    closeProjectWS
} from "@/lib/ws/projectWS"

export function useProjectWebSocket(
    projectId: string
) {

    const setFiles =
        useFileStore((s) => s.setFiles)

    const runtimeReady =
        useRuntimeStore((s) => s.ready)

    useEffect(() => {

        if (!projectId) return

        if (!runtimeReady) return

        function handleMessage(msg: any) {

            switch (msg.type) {

                case "nodes_created":

                    setFiles(prev => {

                        const map =
                            new Map(
                                prev.map(
                                    f => [f.id, f]
                                )
                            )

                        for (const node of msg.nodes) {

                            map.set(
                                node.id,
                                node
                            )

                        }

                        return Array.from(
                            map.values()
                        )

                    })

                    return

                case "nodes_deleted":

                    setFiles(prev =>
                        prev.filter(
                            f =>
                                !msg.ids.includes(
                                    f.id
                                )
                        )
                    )

                    return

            }

        }

        connectProjectWS(
            projectId,
            handleMessage
        )

        return () => {

            closeProjectWS()

        }

    }, [projectId, runtimeReady])

}