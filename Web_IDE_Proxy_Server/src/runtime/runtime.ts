import { materializeProject } from "./materializeProject"
import docker from "./docker"
import { FileNode } from "../types/db"

export async function startProjectContainer(projectId: string, files: FileNode[]) {

    const containerName = `project-${projectId}`

    const container = docker.getContainer(containerName)

    let exists = false
    let isRunning = false

    // -------------------------
    // 1. Check container state
    // -------------------------
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

    let port: number

    // -------------------------
    // 2. Handle cases
    // -------------------------

    if (exists && isRunning) {

        console.log("Reusing running container")

        port = Number(await getContainerPort(containerName))

    } else if (exists && !isRunning) {

        console.log("Starting stopped container")

        await container.start()

        port = Number(await getContainerPort(containerName))

    } else {

        console.log("Creating new container")

        const workspace = await materializeProject(projectId, files)

        const newContainer = await docker.createContainer({
            Image: "cloud-ide-node",
            name: containerName,
            WorkingDir: "/workspace",

            HostConfig: {
                Binds: [`${workspace}:/workspace`],
                PortBindings: {
                    "5173/tcp": [{ HostPort: "" }]
                }
            },

            ExposedPorts: {
                "5173/tcp": {}
            },

            Cmd: ["sleep", "infinity"]
        })

        await newContainer.start()

        port = Number(await getContainerPort(newContainer.id))
    }

    console.log(`Container ready: ${projectId} → ${port}`)

    return port
}

export async function getContainerPort(containerId: string) {

    const container = docker.getContainer(containerId)

    const data = await container.inspect()

    const port =
        data.NetworkSettings.Ports["5173/tcp"][0].HostPort

    return port
}


export async function getRunningContainer(projectId: string) {
    const containerName = `project-${projectId}`
    const container = docker.getContainer(containerName)

    try {
        const info = await container.inspect()

        if (!info.State.Running) return null

        const port = Number(
            info.NetworkSettings.Ports["5173/tcp"][0].HostPort
        )

        return { container, port }

    } catch (err: any) {
        if (err.statusCode === 404) return null
        throw err
    }
}