import {
    startProjectContainer,
    getRunningContainer
} from "../runtime/runtime"

import { runtimeMap } from "../runtime/runtimeMap"
import { lastUsedMap } from "../runtime/activity"


export async function startRuntimeService(
    projectId: string,
    runtimeEnv: any,
    files: any[]
) {

    if (!projectId) {
        throw new Error("projectId required")
    }

    /*
    Prevent duplicate start
    */

    if (runtimeMap.has(projectId)) {

        const existing = runtimeMap.get(projectId)

        return {
            status: "running",
            port: existing?.port
        }
    }

    /*
    Call runtime layer
    */

    await startProjectContainer(projectId, runtimeEnv, files)

    runtimeMap.set(projectId, { host: "", port: 0 })

    lastUsedMap.set(projectId, Date.now())

    return {
        status: "started"
    }

}

export async function pingRuntimeService(
    projectId: string
) {

    const container = await getRunningContainer(projectId)

    if (!container) {
        return {
            status: "stopped"
        }

    }

    lastUsedMap.set(projectId, Date.now())

    return {
        status: "running",
        port: container.port
    }

}

export function runtimeStatusService(
    projectId: string
) {

    const runtime = runtimeMap.get(projectId)

    if (runtime) {

        return {
            running: true,
            port: runtime.port
        }

    }

    return {
        running: false
    }

}