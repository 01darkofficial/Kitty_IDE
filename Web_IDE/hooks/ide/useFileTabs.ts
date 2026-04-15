import { useState } from "react"
import { useFileStore } from "@/store/fileStore"
import { useExplorerStore } from "@/store/explorerStore"
import { FileNode } from "@/types/db"

export function useFileTabs(projectId: string) {

    const [tabs, setTabs] = useState<FileNode[]>([])

    const activeFile = useFileStore((s) => s.activeFile)
    const setActiveFile = useFileStore((s) => s.setActiveFile)
    const setSelectedNodeId = useExplorerStore(s => s.setSelectedNode)
    const setActiveContainerId = useExplorerStore(s => s.setActiveContainer)

    function openFile(file: FileNode) {

        setSelectedNodeId(file.id)

        if (file.type === "folder") {
            setActiveContainerId(file.id)
            return
        }

        setActiveContainerId(file.parent_id ?? null)

        const exists = tabs.find(t => t.id === file.id)
        if (!exists) {
            setTabs(prev => [...prev, file])
        }

        setActiveFile(file, projectId)
    }

    function closeTab(fileId: string) {

        const newTabs = tabs.filter(t => t.id !== fileId)
        setTabs(newTabs)

        if (activeFile?.id === fileId) {
            setActiveFile(
                newTabs[newTabs.length - 1] || null,
                projectId
            )
        }
    }

    function switchTab(file: FileNode) {
        setActiveFile(file, projectId)
    }

    return { tabs, openFile, closeTab, switchTab }
}