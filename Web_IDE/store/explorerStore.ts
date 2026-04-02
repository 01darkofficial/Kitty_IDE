import { create } from "zustand"

type Clipboard = {
    node: any | null
    mode: "copy" | "cut" | null
}

type CreatingNode = {
    parentId: string | null
    type: "file" | "folder"
}

type ExplorerStore = {
    openFolders: Set<string>
    selectedNodeId: string | null
    activeContainerId: string | null
    creatingNode: CreatingNode | null
    renamingNodeId: string | null
    clipboard: Clipboard
    toggleFolder: (id: string, files?: any[]) => void
    setSelectedNode: (id: string | null) => void
    setActiveContainer: (id: string | null) => void
    setCreatingNode: (node: CreatingNode | null) => void
    setRenamingNode: (id: string | null) => void
    setClipboard: (clipboard: Clipboard) => void

}

export const useExplorerStore = create<ExplorerStore>((set, get) => ({

    openFolders: new Set(),
    selectedNodeId: null,
    activeContainerId: null,
    creatingNode: null,
    renamingNodeId: null,
    clipboard: {
        node: null,
        mode: null
    },

    toggleFolder: (folderId, files = []) => {
        set(state => {
            const next = new Set(state.openFolders)
            const wasOpen = next.has(folderId)

            if (wasOpen) {

                next.delete(folderId)

                /*
                If collapsing active container,
                move container to parent
                */

                if (state.activeContainerId === folderId) {
                    const node = files.find((f: any) => f.id === folderId)
                    return {
                        openFolders: next,
                        activeContainerId: node?.parent_id ?? null
                    }
                }
            }
            else {
                next.add(folderId)
            }
            return {
                openFolders: next
            }
        })
    },

    setSelectedNode: (id) => set({
        selectedNodeId: id
    }),

    setActiveContainer: (id) => set({
        activeContainerId: id
    }),

    setCreatingNode: (node) => set({
        creatingNode: node
    }),

    setRenamingNode: (id) => set({
        renamingNodeId: id
    }),

    setClipboard: (clipboard) => set({
        clipboard
    })

}))