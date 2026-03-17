import { materializeProject } from "../runtime/materializeProject"
import docker from "./client"

export async function startProjectContainer(projectId: string) {

    const containerName = `project-${projectId}`

    await removeExistingContainer(docker, containerName)

    const workspace = await materializeProject(projectId)

    const container = await docker.createContainer({
        Image: "cloud-ide-node",
        name: containerName,
        WorkingDir: "/workspace",

        HostConfig: {
            Binds: [
                `${workspace}:/workspace`
            ],

            PortBindings: {
                "5173/tcp": [{ HostPort: "" }]
            }
        },

        ExposedPorts: {
            "5173/tcp": {}
        },

        Cmd: ["bash", "-c", "pnpm install && pnpm dev"]
    })

    await container.start()

    // wait briefly so docker registers port binding
    await new Promise(r => setTimeout(r, 500))

    const port = await getContainerPort(container.id)

    await waitForServer(Number(port))

    await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            projectId,
            port: Number(port)
        })
    })

    // console.log("runtimeMap now:", runtimeMap)

    console.log("Container started:", projectId, "→", port)

    return container
}

export async function getContainerPort(containerId: string) {

    const container = docker.getContainer(containerId)

    const data = await container.inspect()

    const port =
        data.NetworkSettings.Ports["5173/tcp"][0].HostPort

    return port
}

async function removeExistingContainer(docker: any, name: string) {

    try {

        const container = docker.getContainer(name)

        const info = await container.inspect()

        if (info.State.Running) {
            await container.stop()
        }

        await container.remove({ force: true })

        console.log("Removed existing container:", name)

    } catch (err) {
        // container does not exist
    }
}

async function waitForServer(port: number) {

    const url = `http://localhost:${port}`

    for (let i = 0; i < 30; i++) {

        try {
            const res = await fetch(url)

            if (res.ok) return
        } catch { }

        await new Promise(r => setTimeout(r, 500))
    }

    throw new Error("Container server did not start")
}