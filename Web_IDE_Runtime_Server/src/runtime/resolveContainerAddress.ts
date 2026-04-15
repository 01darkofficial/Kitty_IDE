import docker from "./docker"

export interface ContainerAddress {
    host: string;
    port: number;
}
export async function resolveContainerAddress(
    projectId: string,
    containerPort: number
): Promise<ContainerAddress> {

    const containerName = `project-${projectId}`
    const container = docker.getContainer(containerName)
    const info = await container.inspect()
    const networks = info.NetworkSettings.Networks
    const networkNames = Object.keys(networks)

    if (networkNames.length === 0) {
        throw new Error("No networks found for container")
    }

    const firstNetwork = networks[networkNames[0]]
    const ip = firstNetwork.IPAddress

    if (!ip) {
        throw new Error("Container IP not found")

    }

    return {
        host: ip,
        port: containerPort
    }
}