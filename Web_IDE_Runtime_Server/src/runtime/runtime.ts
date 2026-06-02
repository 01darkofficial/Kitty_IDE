import docker from "./docker"
import { RuntimeEnv } from "../types/db"
import { getRuntimeImage } from "./getRuntimeImage"
import Dockerode from "dockerode"
import { containerRuntimeLogger } from "../utils/logger"
import path from "path"
import dotenv from "dotenv";
import { env } from "../config/env"

dotenv.config();

const WORKSPACE_ROOT = env.MAINROOT
containerRuntimeLogger.kittyLog(WORKSPACE_ROOT)

if (!WORKSPACE_ROOT) {
    throw new Error("Missing RUNTIME_API_URL")
}

/**
 * Runtime container metadata.
 */
export interface RunningContainer {
    container: Dockerode.Container
    host: string
    port: number
}

/**
 * Ensures project container exists and is running.
 *
 * Behavior:
 * - Reuses running container
 * - Starts stopped container
 * - Creates container if missing
 */
export async function startProjectContainer(
    projectId: string,
    projectRuntimeEnv: RuntimeEnv
): Promise<void> {

    const containerName = `project-${projectId}`
    const container = docker.getContainer(containerName)

    let exists = false
    let isRunning = false

    /*
    Inspect container state
    */

    try {
        const info = await container.inspect()

        exists = true
        isRunning = info.State.Running

        containerRuntimeLogger.kittyDebug("Container inspect: ", { projectId, exists, isRunning })
    }
    catch (err: any) {
        if (err.statusCode !== 404) {
            containerRuntimeLogger.kittyError("Docker inspect failed: ", { projectId, err })
            throw err
        }
    }

    /*
    Resolve runtime image
    */

    const image = getRuntimeImage(projectRuntimeEnv.node)
    containerRuntimeLogger.kittyDebug("Runtime image selected: ", { projectId, image })

    /*
    Reuse running container
    */

    if (exists && isRunning) {
        containerRuntimeLogger.kittyLog("Reusing running container: ", { projectId })
        return
    }

    /*
    Start stopped container
    */

    if (exists && !isRunning) {
        containerRuntimeLogger.kittyLog("Starting stopped container: ", { projectId })
        await container.start()
        return
    }

    /*
    Create new container
    */

    containerRuntimeLogger.kittyLog("Creating new container: ", { projectId })

    const workspace = path.resolve(WORKSPACE_ROOT!, projectId)
    let newContainer: Dockerode.Container

    try {
        newContainer = await docker.createContainer({
            Image: image,
            name: containerName,
            WorkingDir: "/workspace",
            Env: [
                "HOST=0.0.0.0",
                "HOSTNAME=0.0.0.0",
                "LISTEN_ADDRESS=0.0.0.0",
                "NODE_ENV=development",
                "NODE_OPTIONS=--require /var/lib/cloud-ide/runtime/bindAll.js"
            ],

            HostConfig: {
                Binds: [
                    `${workspace}:/workspace`,
                    `/var/cache/cloud-ide/pnpm-store:/pnpm-store`,
                    `/var/lib/cloud-ide/runtime/bindAll.js:/var/lib/cloud-ide/runtime/bindAll.js`,
                    `/var/lib/cloud-ide/runtime/bin/vite:/usr/local/bin/vite`
                ],
                NetworkMode: "cloud-ide-net"
            },
            Cmd: [
                "sleep",
                "infinity"
            ]
        })
    }
    catch (err) {
        containerRuntimeLogger.kittyError("Container creation failed: ", { projectId, err })
        throw err
    }

    try {
        await newContainer.start()
        containerRuntimeLogger.kittyLog("Container started: ", { projectId })
    }
    catch (err) {
        containerRuntimeLogger.kittyError("Container start failed: ", { projectId, err })
        throw err
    }
}

/**
 * Returns running container metadata.
 *
 * Returns null if:
 * - container missing
 * - container not running
 */
export async function getRunningContainer(
    projectId: string
): Promise<RunningContainer | null> {

    const containerName = `project-${projectId}`
    const container = docker.getContainer(containerName)

    try {
        const info = await container.inspect()

        if (!info.State.Running) {
            containerRuntimeLogger.kittyDebug("Container not running: ", { projectId })
            return null
        }

        /*
        Resolve container IP
        */

        const networks = info.NetworkSettings.Networks
        const networkName = Object.keys(networks)[0]
        const containerIP = networks[networkName].IPAddress

        containerRuntimeLogger.kittyDebug("Container running: ", { projectId, ip: containerIP })

        return {
            container,
            host: containerIP,
            port: 0 // detected later
        }
    }
    catch (err: any) {
        if (err.statusCode === 404) {
            containerRuntimeLogger.kittyDebug("Container not found: ", { projectId })
            return null
        }

        containerRuntimeLogger.kittyError("Container inspect failed: ", { projectId, err })

        throw err
    }
}