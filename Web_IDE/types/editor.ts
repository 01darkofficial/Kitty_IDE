import { FileNode } from "./db"

export interface EditorFile {
    content: string
    dirty: boolean
    version: number
    lastLoaded: number
}

export type PreviewFile = {
    id: string
    content: string
    mimeType: string
}


export type Request = {
    projectId: string
    fileId: string
    allFiles: FileNode[]
}