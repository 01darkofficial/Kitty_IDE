import path from "path"

import { LspSession } from "../types/lsp"

const ROOT = process.env.MAINROOT ?? "/var/lib/cloud-ide/projects"

export function createSession(
    userId: string,
    projectId: string
): LspSession {

    return {
        sessionKey: `${userId}:${projectId}`,
        userId,
        projectId,
        workspacePath: path.join(ROOT, projectId),
        process: null,
        stdoutBuffer: "",
        documents: new Map(),
        uriToFileId: new Map(),
        fileIdToUri: new Map(),
        lastActivity: Date.now(),
    }
}

export function touchSession(session: LspSession) {
    session.lastActivity = Date.now()
}

export function registerUri(
    session: LspSession,
    fileId: string,
    uri: string
) {
    session.fileIdToUri.set(fileId, uri)
    session.uriToFileId.set(uri, fileId)
}

export function unregisterUri(
    session: LspSession,
    fileId: string
) {
    const uri = session.fileIdToUri.get(fileId)

    if (!uri) return

    session.fileIdToUri.delete(fileId)
    session.uriToFileId.delete(uri)
}