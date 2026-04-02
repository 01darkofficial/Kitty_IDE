import { FileNode } from "@/types/db"
import { create } from "zustand"

type FileStore = {
    files: FileNode[]
    activeFile: FileNode | null
    setFiles: (files: FileNode[]) => void
    setActiveFile: (file: FileNode, projectId: string) => Promise<void>
    updateFileContent: (id: string, content: string) => void
}

export const useFileStore = create<FileStore>((set, get) => ({

    files: [],
    activeFile: null,
    setFiles: (files) => set({ files }),
    /*
    Load file from disk
    */

    setActiveFile: async (file, projectId) => {
        const existing = get().files.find(f => f.id === file.id)

        /*
        If content already exists,
        don't fetch again
        */

        if (existing?.content) {
            set({ activeFile: existing })
            return
        }

        set({
            activeFile: {
                ...file,
                content: ""
            }
        })

        try {
            const res = await fetch(`/api/projects/${projectId}/readFile`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: file.id
                    })
                }
            )

            const data = await res.json()

            set((state) => ({

                files: state.files.map((f) => f.id === file.id ? {
                    ...f,
                    content: data.content
                } : f),

                activeFile: {
                    ...file,
                    content: data.content
                }
            }))
        } catch (err) {
            console.error(
                "FILE LOAD ERROR:",
                err
            )
        }
    },

    updateFileContent: (id, content) => set((state) => ({

        files: state.files.map((file) => file.id === id ? {
            ...file,
            content
        } : file),

        activeFile: state.activeFile?.id === id ? {
            ...state.activeFile,
            content
        } : state.activeFile
    }))
}))