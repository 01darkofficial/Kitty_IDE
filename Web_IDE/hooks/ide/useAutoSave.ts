import { useEffect, RefObject } from "react"
import { saveFile } from "@/lib/api/projects/files"
import { useFileStore } from "@/store/fileStore"

export function useAutoSave(
    projectId: string,
    runtime: string,
    iframeRef: RefObject<HTMLIFrameElement | null>
) {

    const activeFile = useFileStore((s) => s.activeFile)

    useEffect(() => {

        const handler = (e: KeyboardEvent) => {

            if ((e.ctrlKey || e.metaKey) && e.key === "s") {

                e.preventDefault()
                if (!activeFile) return

                saveFile(activeFile)

                if (runtime === "static" && iframeRef.current) {
                    iframeRef.current.src = `/preview/${projectId}/index.html?ts=${Date.now()}`
                }
            }
        }

        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)

    }, [activeFile, runtime, projectId])
}