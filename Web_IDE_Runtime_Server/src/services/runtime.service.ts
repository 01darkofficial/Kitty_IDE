import { startProjectContainer, getRunningContainer } from "../runtime/runtime"
import { runtimeMap } from "../runtime/runtimeMap"
import { lastUsedMap } from "../runtime/activity"
import docker from "../runtime/docker"
import { runtimeLogger } from "../utils/logger"

/**
 * Runtime container lifecycle manager.
 *
 * Handles:
 * - container reuse
 * - container start
 * - container creation
 *
 * Side effects:
 * - Updates runtimeMap
 * - Updates lastUsedMap
 */
export async function startRuntimeService(
    projectId: string,
    runtimeEnv: any,
    files: any[]
) {

    if (!projectId) {
        runtimeLogger.kittyError("Missing projectId")
        throw new Error("projectId required")
    }

    runtimeLogger.kittyLog("Start requested: ", { projectId })

    const containerName = `project-${projectId}`
    const dockerContainer = docker.getContainer(containerName)

    let exists = false
    let isRunning = false

    // Inspect container state

    try {
        const info = await dockerContainer.inspect()

        exists = true
        isRunning = info.State.Running

        runtimeLogger.kittyDebug("Inspect success: ", { projectId, exists, isRunning })
    }
    catch (err: any) {
        if (err.statusCode === 404) {
            exists = false
            runtimeLogger.kittyDebug("Container not found: ", { projectId })
        }
        else {
            runtimeLogger.kittyError("Inspect failed: ", { projectId, err })
            throw err
        }
    }

    // CASE: reuse running container

    if (exists && isRunning) {

        runtimeLogger.kittyLog("Reusing container: ", { projectId })

        const running = await getRunningContainer(projectId)

        if (running) {
            runtimeMap.set(projectId, { host: running.host, port: 0 })
        }

        lastUsedMap.set(projectId, Date.now())

        return { status: "running" }
    }

    // CASE: start stopped container

    if (exists && !isRunning) {

        runtimeLogger.kittyLog("Starting container: ", { projectId })

        try {
            await dockerContainer.start()
        }
        catch (err) {
            runtimeLogger.kittyError("Start failed: ", { projectId, err })
            throw err
        }

        // Allow network attach
        await new Promise(
            r => setTimeout(r, 500)
        )

        const running = await getRunningContainer(projectId)

        if (running) {
            runtimeMap.set(projectId, { host: running.host, port: 0 })
        }

        lastUsedMap.set(projectId, Date.now())

        return { status: "started" }
    }

    // CASE: create container

    runtimeLogger.kittyLog("Creating container: ", { projectId })

    try {
        await startProjectContainer(projectId, runtimeEnv, files)

    }
    catch (err) {
        runtimeLogger.kittyError("Creation failed: ", { projectId, err })
        throw err
    }

    // Allow container boot
    await new Promise(
        r => setTimeout(r, 500)
    )

    const running = await getRunningContainer(projectId)

    if (running) {
        runtimeMap.set(projectId, { host: running.host, port: 0 })
    }

    lastUsedMap.set(projectId, Date.now())

    return { status: "started" }
}

/**
 * Lightweight runtime heartbeat.
 *
 * Updates last activity timestamp
 * if container is alive.
 */
export async function pingRuntimeService(
    projectId: string
) {

    const container = await getRunningContainer(projectId)

    if (!container) {

        runtimeLogger.kittyDebug("Ping: stopped ", { projectId })
        return { status: "stopped" }
    }

    lastUsedMap.set(projectId, Date.now())
    runtimeLogger.kittyDebug("Ping: running ", { projectId, port: container.port })

    return {
        status: "running",
        port: container.port
    }
}

/**
 * Returns runtime execution state.
 *
 * Updates runtimeMap if active.
 */
export async function runtimeStatusService(
    projectId: string
) {
    try {
        const container = await getRunningContainer(projectId)

        if (!container) {
            runtimeLogger.kittyDebug("Status: stopped ", { projectId })
            return { running: false }
        }

        runtimeMap.set(projectId, { host: container.host, port: container.port })
        runtimeLogger.kittyDebug("Status: running ", { projectId, port: container.port })

        return {
            running: true,
            port: container.port
        }
    }
    catch (err) {
        runtimeLogger.kittyError("Status failed: ", { projectId, err })
        return { running: false }
    }
}