import { FileNode } from "@/types/db"
import { create } from "zustand"


type FileStore = {
    files: FileNode[]
    activeFile: FileNode | null

    setFiles: (files: FileNode[]) => void
    setActiveFile: (file: FileNode) => void

    updateFileContent: (id: string, content: string) => void
}

export const useFileStore = create<FileStore>((set) => ({

    files: [],
    activeFile: null,

    setFiles: (files) => set({ files }),

    setActiveFile: (file) => set({ activeFile: file }),

    updateFileContent: (id, content) =>
        set((state) => ({
            files: state.files.map((file) =>
                file.id === id ? { ...file, content } : file
            )
        }))

}))