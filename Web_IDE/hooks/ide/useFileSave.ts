import { useEffect } from "react"

import { saveFile } from "@/lib/api/projects/files"
import { useFileStore } from "@/store/fileStore"

const AUTO_SAVE_DELAY = 2000

export function useManualSave(
    projectId: string,
) {
    const activeFileId = useFileStore((s) => s.activeFileId)
    const editorFiles = useFileStore((s) => s.editorFiles)
    const markSaved = useFileStore((s) => s.markSaved)

    useEffect(() => {
        async function handler(e: KeyboardEvent) {
            if (!(e.ctrlKey || e.metaKey) || e.key !== "s") return

            e.preventDefault()

            if (!activeFileId) return

            const file = editorFiles[activeFileId]

            if (!file || !file.dirty) return

            try {
                await saveFile(projectId, activeFileId, file.content)
                markSaved(activeFileId)
            } catch (err) {
                console.error("Save failed:", err)
            }
        }

        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [
        activeFileId,
        editorFiles,
        markSaved,
        projectId
    ])
}

export function useDebouncedSave(projectId: string) {
    const activeFileId = useFileStore((s) => s.activeFileId)
    const editorFiles = useFileStore((s) => s.editorFiles)
    const markSaved = useFileStore((s) => s.markSaved)

    useEffect(() => {
        if (!activeFileId) return

        const file = editorFiles[activeFileId]

        if (!file || !file.dirty) return

        const timer = setTimeout(async () => {
            try {
                await saveFile(projectId, activeFileId, file.content)
                markSaved(activeFileId)
            } catch (err) {
                console.error("Autosave failed:", err)
            }
        }, AUTO_SAVE_DELAY)

        return () => clearTimeout(timer)
    }, [activeFileId, editorFiles[activeFileId!]?.content])
}