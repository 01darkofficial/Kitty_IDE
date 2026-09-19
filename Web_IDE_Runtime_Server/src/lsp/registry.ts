import { LspSession } from "../types/lsp"

/*
|--------------------------------------------------------------------------
| In-memory LSP Session Registry
|--------------------------------------------------------------------------
|
| Stores active LSP sessions for the lifetime of the runtime server.
| This file does NOT create or destroy sessions.
| It only provides CRUD operations over the registry.
|
*/

const sessions = new Map<string, LspSession>()

export function getSession(sessionKey: string): LspSession | undefined {
    return sessions.get(sessionKey)
}

export function setSession(session: LspSession): void {
    sessions.set(session.sessionKey, session)
}

export function hasSession(sessionKey: string): boolean {
    return sessions.has(sessionKey)
}

export function deleteSession(sessionKey: string): void {
    sessions.delete(sessionKey)
}

export function getAllSessions(): LspSession[] {
    return Array.from(sessions.values())
}