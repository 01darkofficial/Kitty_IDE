import docker from "../runtime/docker"
import { parseLsOutput } from "../filesystem/parseLsOutput"

export async function listFiles(projectId: string) {

    const containerName = `project-${projectId}`

    const container =
        docker.getContainer(containerName)

    const exec = await container.exec({
        Cmd: ["sh", "-c", "ls -R /workspace"],
        AttachStdout: true,
        AttachStderr: true
    })

    const stream =
        await exec.start({ hijack: true })

    let output = ""

    return new Promise((resolve, reject) => {

        stream.on("data", (chunk: Buffer) => {

            if (chunk.length > 8) {

                const payload = chunk.slice(8)

                output += payload.toString("utf-8")
            }

        })

        stream.on("end", () => {

            const files =
                parseLsOutput(output)

            resolve(files)

        })

        stream.on("error", reject)

    })
}