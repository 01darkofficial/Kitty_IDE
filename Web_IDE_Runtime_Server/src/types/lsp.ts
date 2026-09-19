import { ChildProcessWithoutNullStreams } from "child_process"

export interface OpenDocument {
    fileId: string
    uri: string
    languageId: string

    version: number
    content: string
}

export interface LspSession {
    sessionKey: string
    userId: string
    projectId: string
    workspacePath: string
    process: ChildProcessWithoutNullStreams | null
    stdoutBuffer: string
    documents: Map<string, OpenDocument>
    uriToFileId: Map<string, string>
    fileIdToUri: Map<string, string>
    lastActivity: number
}