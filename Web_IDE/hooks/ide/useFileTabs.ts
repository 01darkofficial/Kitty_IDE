"use client"

import { useMemo } from "react"

import { useExplorerStore } from "@/store/explorerStore"
import { useFileStore } from "@/store/fileStore"

import { FileNode } from "@/types/db"
import { saveFile } from "@/lib/api/projects/files"

export function useFileTabs(projectId: string) {

    /* ---------------- File Store ---------------- */

    const files = useFileStore((s) => s.files)

    const editorFiles = useFileStore((s) => s.editorFiles)

    const openTabs = useFileStore((s) => s.openTabs)
    const activeFileId = useFileStore((s) => s.activeFileId)

    const markSaved = useFileStore((s) => s.markSaved)
    const openTab = useFileStore((s) => s.openTab)
    const closeTabInStore = useFileStore((s) => s.closeTab)
    const setActiveFile = useFileStore((s) => s.setActiveFile)
    const setEditorFile = useFileStore((s) => s.setEditorFile)

    /* ---------------- Explorer Store ---------------- */

    const setSelectedNode = useExplorerStore((s) => s.setSelectedNode)
    const setActiveContainer = useExplorerStore((s) => s.setActiveContainer)

    /* ---------------- Derived State ---------------- */

    const tabs = useMemo(() =>
        openTabs.map((id) => files.find((file) => file.id === id)).filter(Boolean) as FileNode[],
        [openTabs, files]
    )

    const activeFile = useMemo(() => {
        if (!activeFileId) return null

        const meta = files.find((file) => file.id === activeFileId)
        const editor = editorFiles[activeFileId]

        if (!meta || !editor) return null

        return {
            ...meta,
            ...editor,
        }
    }, [activeFileId, files, editorFiles])

    /* ---------------- Open File ---------------- */

    async function openFile(file: FileNode) {

        setSelectedNode(file.id)

        if (file.type === "folder") {
            setActiveContainer(file.id)
            return
        }

        setActiveContainer(file.parent_id)

        // Open tab immediately.
        openTab(file.id)

        // Use cached content if available.
        if (editorFiles[file.id]) {
            setActiveFile(file.id)
            return
        }

        // Fetch from workspace.
        const res = await fetch(`/api/projects/${projectId}/readFile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fileId: file.id,
            }),
        })

        if (!res.ok) return

        const { content } = await res.json()

        setEditorFile(file.id, content)
        setActiveFile(file.id)
    }

    /* ---------------- Tabs ---------------- */

    function switchTab(file: FileNode) {
        setActiveFile(file.id)
    }

    async function closeTab(fileId: string) {
        const editorFile = editorFiles[fileId]

        closeTabInStore(fileId)

        // Save before closing if there are unsaved changes.
        if (editorFile?.dirty) {
            try {
                await saveFile(projectId, fileId, editorFile.content)
                markSaved(fileId)
            } catch (err) {
                console.error("Failed to save before closing:", err)
                // Later can show a toast if save failed.
            }
        }
    }

    return {
        tabs,
        activeFile,
        openFile,
        switchTab,
        closeTab,
    }
}