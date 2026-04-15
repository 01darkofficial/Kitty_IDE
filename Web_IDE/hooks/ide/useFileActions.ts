import { useFileStore } from "@/store/fileStore"
import { useExplorerStore } from "@/store/explorerStore"
import { createNode, deleteNodes } from "@/lib/api/projects/files"
import { FileNode, Project } from "@/types/db"
import { ExplorerAction } from "@/types/components/ide"

export function useFileActions(project: Project) {

    const files = useFileStore((s) => s.files)
    const setFiles = useFileStore((s) => s.setFiles)
    const activeContainerId = useExplorerStore(s => s.activeContainerId)
    const creatingNode = useExplorerStore(s => s.creatingNode)
    const setCreatingNode = useExplorerStore(s => s.setCreatingNode)
    const clipboard = useExplorerStore(s => s.clipboard)
    const setClipboard = useExplorerStore(s => s.setClipboard)

    async function createFile(name: string) {
        if (!creatingNode) return
        const node: FileNode = await createNode(project.id, {
            id: crypto.randomUUID(),
            project_id: project.id,
            parent_id: creatingNode.parentId,
            name,
            type: "file",
            content: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        setFiles([...files, node])
    }

    async function createFolder(name: string) {
        if (!creatingNode) return
        const node: FileNode = await createNode(project.id, {
            id: crypto.randomUUID(),
            project_id: project.id,
            parent_id: creatingNode.parentId,
            name,
            type: "folder",
            content: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        setFiles([...files, node])
    }

    async function handleCreateInline(name: string | null) {
        if (!creatingNode) {
            setCreatingNode(null)
            return
        }
        if (!name) {
            setCreatingNode(null)
            return
        }
        if (creatingNode.type === "file") {
            await createFile(name)
        } else {
            await createFolder(name)
        }
        setCreatingNode(null)
    }

    async function deleteNode(nodeId: string) {
        const idsToDelete = new Set<string>()

        function collect(id: string) {
            idsToDelete.add(id)
            files.filter(f => f.parent_id === id).forEach(child => collect(child.id))
        }

        collect(nodeId)
        const ids = Array.from(idsToDelete)

        try {
            await deleteNodes(project.id, ids)
            setFiles(files.filter(f => !idsToDelete.has(f.id)))
        } catch (err) {
            console.error("Delete failed:", err)
        }
    }

    function pasteNode(targetFolderId: string | null) {
        if (!clipboard.node) return

        if (clipboard.mode === "copy") {
            const cloned = {
                ...clipboard.node,
                id: crypto.randomUUID(),
                parent_id: targetFolderId
            }
            setFiles([...files, cloned])
        }

        if (clipboard.mode === "cut") {
            const updated = files.map(f =>
                f.id === clipboard.node!.id ? { ...f, parent_id: targetFolderId } : f
            )
            setFiles(updated)
            setClipboard({ node: null, mode: null })
        }
    }

    function handleNodeAction(action: ExplorerAction, node: FileNode | null) {

        if (creatingNode && action.startsWith("new")) return

        switch (action) {
            case "new-file-root":
                setCreatingNode({ parentId: activeContainerId, type: "file" })
                return
            case "new-folder-root":
                setCreatingNode({ parentId: activeContainerId, type: "folder" })
                return
            case "new-file":
                if (!node) return
                setCreatingNode({ parentId: node.id, type: "file" })
                return
            case "new-folder":
                if (!node) return
                setCreatingNode({ parentId: node.id, type: "folder" })
                return
            case "delete":
                if (!node) return
                deleteNode(node.id)
                return
            case "copy":
                if (!node) return
                setClipboard({ node, mode: "copy" })
                return
            case "cut":
                if (!node) return
                setClipboard({ node, mode: "cut" })
                return
            case "paste":
                if (!node) return
                pasteNode(node.type === "folder" ? node.id : node.parent_id ?? null)
                return
        }
    }

    return { handleCreateInline, handleNodeAction }
}