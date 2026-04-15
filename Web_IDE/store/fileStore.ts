import { FileNode } from "@/types/db"
import { create } from "zustand"
import { explorerLogger } from "@/utils/logger"

type FileStore = {
    files: FileNode[]
    activeFile: FileNode | null
    setFiles: (files: | FileNode[] | ((prev: FileNode[]) => FileNode[])) => void
    setActiveFile: (file: FileNode, projectId: string) => Promise<void>
    updateFileContent: (id: string, content: string) => void
}

/**
 * File store managing file tree state and
 * file content loading from backend.
 */
export const useFileStore =
    create<FileStore>((set, get) => ({

        files: [],
        activeFile: null,

        setFiles: (files) => set((state) => ({
            files: typeof files === "function" ? files(state.files) : files
        })),

        /**
         * Loads file content from backend
         * if not already cached locally.
         */
        setActiveFile:
            async (file, projectId) => {

                if (!file) {
                    set({ activeFile: null })
                    return
                }

                const existing = get().files.find(
                    f => f.id === file.id
                )

                // Use cached content if available
                if (existing?.content) {
                    explorerLogger.kittyDebug("Using cached file: ", file.id)
                    set({ activeFile: existing })
                    return
                }

                explorerLogger.kittyLog("Loading file: ", file.id)

                // Set placeholder before fetch
                set({
                    activeFile: {
                        ...file,
                        content: ""
                    }
                })

                try {

                    const res = await fetch(`/api/projects/${projectId}/readFile`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id: file.id
                        })
                    })

                    if (!res.ok) {
                        explorerLogger.kittyError("File read API failed:", res.status)
                        return
                    }

                    const data = await res.json()

                    explorerLogger.kittyDebug("File loaded: ", file.id)

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
                }

                catch (err) {
                    explorerLogger.kittyError("File load failed: ", file.id, err)
                }
            },

        /**
         * Updates file content in local store.
         */
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