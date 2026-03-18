export const lastUsedMap = new Map<string, number>()

export function updateLastUsed(projectId: string) {
    lastUsedMap.set(projectId, Date.now())
}