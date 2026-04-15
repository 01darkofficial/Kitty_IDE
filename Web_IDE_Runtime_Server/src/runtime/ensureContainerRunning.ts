import Dockerode from "dockerode"
import docker from "./docker"
import { runtimeMap } from "./runtimeMap"

export async function ensureContainerRunning(
    projectId: string
): Promise<Dockerode.Container> {

    const containerName = `project-${projectId}`
    const container = docker.getContainer(containerName)

    console.log("Looking for container:", containerName)

    try {
        const info = await container.inspect()

        if (!info.State.Running) {
            console.log("Starting stopped container:", projectId)

            await container.start()
            await new Promise(
                r => setTimeout(r, 500)
            )
        }

        const networks = info.NetworkSettings.Networks
        const networkNames = Object.keys(networks)

        if (networkNames.length === 0) {
            throw new Error("No networks found for container")
        }

        const firstNetwork = networks[networkNames[0]]
        const ip = firstNetwork.IPAddress

        if (!ip) {
            throw new Error("Container IP missing")
        }

        console.log("Container IP:", ip
        )

        runtimeMap.set(projectId, {
            host: ip,
            port: 0
        })

    } catch (err: any) {

        if (err.statusCode === 404) {
            throw new Error("Container missing")
        }

        throw err
    }

    return container
}