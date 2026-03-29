import { materializeProject } from "./materializeProject"
import docker from "./docker"
import { FileNode, RuntimeEnv } from "../types/db"
import { getRuntimeImage } from "./getRuntimeImage"
import Dockerode from "dockerode"

export interface RunningContainer {
    container: Dockerode.Container
    host: string
    port: number
}

export async function startProjectContainer(
    projectId: string,
    projectRuntimeEnv: RuntimeEnv,
    files: FileNode[]
): Promise<void> {

    const containerName = `project-${projectId}`
    const container = docker.getContainer(containerName)

    let exists = false
    let isRunning = false

    try {
        const info = await container.inspect()

        exists = true
        isRunning = info.State.Running

    } catch (err: any) {
        if (err.statusCode !== 404) {
            console.error("Docker inspect error:", err)
            throw err
        }
    }

    // -------------------------
    // Fetch project runtime
    // -------------------------

    const image = getRuntimeImage(projectRuntimeEnv.node)

    console.log("Using runtime image:", image)

    // -------------------------
    // Create container if needed
    // -------------------------

    if (exists && isRunning) {
        console.log("Reusing running container")
        return
    }

    if (exists && !isRunning) {
        console.log("Starting stopped container")
        await container.start()
        return
    }

    console.log("Creating new container")
    const workspace = await materializeProject(projectId, files)

    const newContainer = await docker.createContainer({
        Image: image,
        name: containerName,
        WorkingDir: "/workspace",
        HostConfig: {
            Binds: [
                `${workspace}:/workspace`,
                `/var/cache/cloud-ide/pnpm-store:/pnpm-store`
            ]
        },
        Cmd: ["sleep", "infinity"]
    })

    await newContainer.start()

}


export async function getRunningContainer(
    projectId: string
): Promise<RunningContainer | null> {

    const containerName = `project-${projectId}`
    const container = docker.getContainer(containerName)

    try {
        const info = await container.inspect()

        if (!info.State.Running) {
            return null
        }

        // Get container IP safely
        const networks = info.NetworkSettings.Networks
        const networkName = Object.keys(networks)[0]
        const containerIP = networks[networkName].IPAddress

        return {
            container,
            host: containerIP,
            port: 0 // will be detected later
        }

    } catch (err: any) {
        if (err.statusCode === 404) {
            return null
        }
        throw err
    }

}