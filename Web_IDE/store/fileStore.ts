"use client"

import { create } from "zustand"

import { FileNode } from "@/types/db"
import { EditorFile } from "@/types/editor"

type FileStore = {
    /* ---------------- Project Metadata ---------------- */
    files: FileNode[]
    setFiles: (files: FileNode[] | ((prev: FileNode[]) => FileNode[])) => void
    addFile: (file: FileNode) => void
    updateFileMeta: (fileId: string, updates: Partial<FileNode>) => void
    removeFile: (fileId: string) => void

    /* ---------------- Editor Cache ---------------- */
    editorFiles: Record<string, EditorFile>
    setEditorFile: (fileId: string, content: string) => void
    setEditorFiles: (files: Record<string, { id: string, content: string }>) => void
    removeEditorFile: (fileId: string) => void
    updateFileContent: (fileId: string, content: string) => void
    markSaved: (fileId: string) => void

    /* Static Preview Cache */
    previewLoaded: boolean

    /* ---------------- Editor State ---------------- */
    openTabs: string[]
    activeFileId: string | null
    activeFile: EditorFile | null
    openTab: (fileId: string) => void
    closeTab: (fileId: string) => void
    setActiveFile: (fileId: string | null) => void

    /* ---------------- Utilities ---------------- */
    reset: () => void
}

export const useFileStore = create<FileStore>((set) => ({

    /* ---------------- Initial State ---------------- */
    files: [],
    editorFiles: {},
    openTabs: [],
    activeFileId: null,
    activeFile: null,
    previewFiles: {},
    previewLoaded: false,

    /* ---------------- Project Metadata ---------------- */

    setFiles: (files) => set((state) => ({
        files: typeof files === "function" ? files(state.files) : files,
    })),

    addFile: (file) => set((state) => ({ files: [...state.files, file] })),

    updateFileMeta: (fileId, updates) => set((state) => ({
        files: state.files.map((file) => file.id === fileId ? { ...file, ...updates } : file),
    })),

    removeFile: (fileId) => set((state) => {
        const nextEditorFiles = { ...state.editorFiles }
        delete nextEditorFiles[fileId]
        const nextTabs = state.openTabs.filter((id) => id !== fileId)
        const nextActiveId = state.activeFileId === fileId ? nextTabs[nextTabs.length - 1] ?? null : state.activeFileId

        return {
            files: state.files.filter((f) => f.id !== fileId),
            editorFiles: nextEditorFiles,
            openTabs: nextTabs,
            activeFileId: nextActiveId,
            activeFile: nextActiveId ? nextEditorFiles[nextActiveId] : null,
        }
    }),

    /* ---------------- Editor Cache ---------------- */

    setEditorFile: (fileId, content) => set((state) => {
        const editorFile: EditorFile = {
            content,
            dirty: false,
            version: 1,
            lastLoaded: Date.now(),
        }

        return {
            editorFiles: { ...state.editorFiles, [fileId]: editorFile },
            activeFile: state.activeFileId === fileId ? editorFile : state.activeFile,
        }
    }),

    setEditorFiles: (files) => set((state) => {
        const nextEditorFiles = { ...state.editorFiles }

        for (const file of Object.values(files)) {
            nextEditorFiles[file.id] = {
                content: file.content,
                dirty: false, version: 1,
                lastLoaded: Date.now(),
            }
        }

        return {
            editorFiles: nextEditorFiles,
        }
    }),

    removeEditorFile: (fileId) => set((state) => {
        const nextEditorFiles = { ...state.editorFiles }
        delete nextEditorFiles[fileId]

        return {
            editorFiles: nextEditorFiles,
            activeFile: state.activeFileId === fileId ? null : state.activeFile,
        }
    }),

    updateFileContent: (fileId, content) => set((state) => {
        const file = state.editorFiles[fileId]
        if (!file) return state

        const updatedFile: EditorFile = {
            ...file,
            content,
            dirty: true,
            version: file.version + 1,
        }

        return {
            editorFiles: {
                ...state.editorFiles,
                [fileId]: updatedFile,
            },
        }
    }),

    markSaved: (fileId) => set((state) => {
        const file = state.editorFiles[fileId]

        if (!file) return state

        const updatedFile: EditorFile = { ...file, dirty: false, }

        return {
            editorFiles: {
                ...state.editorFiles,
                [fileId]: updatedFile,
            },
            activeFile: state.activeFileId === fileId ? updatedFile : state.activeFile,
        }
    }),

    /* ---------------- Editor State ---------------- */

    openTab: (fileId) => set((state) => ({
        openTabs: state.openTabs.includes(fileId) ? state.openTabs : [...state.openTabs, fileId],
        activeFileId: fileId,
        activeFile: state.editorFiles[fileId] ?? null,
    })),

    closeTab: (fileId) => set((state) => {
        const nextTabs = state.openTabs.filter((id) => id !== fileId)

        const nextActiveId = state.activeFileId === fileId ? nextTabs[nextTabs.length - 1] ?? null : state.activeFileId

        return {
            openTabs: nextTabs,
            activeFileId: nextActiveId,
            activeFile: nextActiveId ? state.editorFiles[nextActiveId] : null,
        }
    }),

    setActiveFile: (fileId) => set((state) => ({
        activeFileId: fileId,
        activeFile: fileId ? state.editorFiles[fileId] ?? null : null,
    })),

    /* ---------------- Reset ---------------- */

    reset: () => set({
        files: [],
        editorFiles: {},
        openTabs: [],
        activeFileId: null,
        activeFile: null,
    }),
}))