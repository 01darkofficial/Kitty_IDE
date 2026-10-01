"use client"

import { useMemo } from "react"

import { useExplorerStore } from "@/store/explorerStore"
import { useFileStore } from "@/store/fileStore"

import { FileNode } from "@/types/db"
import { saveFile } from "@/lib/api/projects/files"
import { sendDidClose, sendDidOpen } from "@/lib/lsp/client"
import { buildFileUri } from "@/lib/lsp/buildFileUri"
import { getLspLanguage } from "@/lib/editor/getLanguage"
import { editorLogger } from "@/utils/logger"

/**
 * Manages editor tabs and synchronizes their document lifecycle with the LSP.
 */
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
        const wasAlreadyOpen = openTabs.includes(file.id)

        // Open tab immediately.
        openTab(file.id)

        const uri = buildFileUri(projectId, file.id, files)
        const lspLanguage = getLspLanguage(file.name)

        // Use cached content if available.
        if (editorFiles[file.id]) {
            setActiveFile(file.id)
            if (!wasAlreadyOpen && lspLanguage) {
                const uri = buildFileUri(projectId, file.id, files)
                sendDidOpen(uri, lspLanguage, editorFiles[file.id].content)
            }
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
        if (lspLanguage) {
            sendDidOpen(uri, lspLanguage, content)
        }
        setActiveFile(file.id)
    }

    /* ---------------- Tabs ---------------- */

    function switchTab(file: FileNode) {
        setActiveFile(file.id)
    }

    async function closeTab(fileId: string) {
        const editorFile = editorFiles[fileId]

        closeTabInStore(fileId)
        sendDidClose(buildFileUri(projectId, fileId, files))

        // Save before closing if there are unsaved changes.
        if (editorFile?.dirty) {
            try {
                await saveFile(projectId, fileId, editorFile.content)
                markSaved(fileId)
            } catch (err) {
                editorLogger.kittyError("Failed to save before closing:", err)
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
