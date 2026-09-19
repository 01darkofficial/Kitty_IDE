import { LspSession } from "../types/lsp"
import { startTypescriptServer, stopTypescriptServer } from "./languages/typescript"

import {
    getSession,
    setSession,
    deleteSession,
} from "./registry"

import {
    createSession,
    touchSession,
} from "./session"

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

function buildSessionKey(userId: string, projectId: string) {
    return `${userId}:${projectId}`
}

/* -------------------------------------------------------------------------- */
/* Session Manager */
/* -------------------------------------------------------------------------- */

export function getOrCreateSession(
    userId: string,
    projectId: string
): LspSession {

    const sessionKey = buildSessionKey(userId, projectId)

    const existing = getSession(sessionKey)

    if (existing) {
        touchSession(existing)
        return existing
    }

    const session = createSession(userId, projectId)

    startTypescriptServer(session)

    setSession(session)
    touchSession(session)

    return session
}

export function getExistingSession(
    userId: string,
    projectId: string
): LspSession | undefined {

    const sessionKey = buildSessionKey(userId, projectId)

    return getSession(sessionKey)
}

export function touchSessionActivity(session: LspSession) {
    touchSession(session)
}

export function disposeSession(
    userId: string,
    projectId: string
) {

    const sessionKey = buildSessionKey(userId, projectId)

    const session = getSession(sessionKey)

    if (!session) return

    stopTypescriptServer(session)
    deleteSession(sessionKey)
}