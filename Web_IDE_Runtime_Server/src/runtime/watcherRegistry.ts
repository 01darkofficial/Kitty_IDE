const watcherMap =
    new Map<string, any>()

export function hasWatcher(
    projectId: string
) {
    return watcherMap.has(projectId)
}

export function registerWatcher(
    projectId: string,
    watcher: any
) {
    watcherMap.set(
        projectId,
        watcher
    )
}

export function stopWatcher(
    projectId: string
) {

    const watcher =
        watcherMap.get(projectId)

    if (watcher) {

        watcher.close()

        watcherMap.delete(
            projectId
        )

    }

}
