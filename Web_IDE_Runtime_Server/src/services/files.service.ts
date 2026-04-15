import docker from "../runtime/docker"
import { parseLsOutput } from "../filesystem/parseLsOutput"
import { createFileOnDisk } from "../filesystem/createFile"
import { updateFileOnDisk } from "../filesystem/updateFile"
import { readFileFromDisk } from "../filesystem/readFile"
import { deleteFileFromDisk } from "../filesystem/deleteFile"
import { FileNode } from "../types/db"

export async function listFiles(projectId: string) {

    try {

        const containerName = `project-${projectId}`
        const container = docker.getContainer(containerName)

        const exec = await container.exec({
            Cmd: ["sh", "-c", "ls -R /workspace"],
            AttachStdout: true,
            AttachStderr: true
        })

        const stream = await exec.start({ hijack: true })

        let output = ""

        return new Promise((resolve, reject) => {

            stream.on("data", (chunk: Buffer) => {
                try {
                    if (chunk.length > 8) {
                        const payload = chunk.slice(8)
                        output += payload.toString("utf-8")
                    }
                } catch (err) {
                    reject(err)
                }
            })

            stream.on("end", () => {
                try {
                    const files = parseLsOutput(output)
                    resolve(files)
                } catch (err) {
                    reject(err)
                }
            })

            stream.on("error", reject)
        })
    } catch (err) {
        console.error("listFiles failed:", {
            projectId,
            error: err
        })
        throw err
    }
}

export async function createFileService(
    projectId: string,
    file: FileNode,
    allFiles: FileNode[]
) {
    try {
        if (!projectId) {
            throw new Error("projectId required")
        }

        if (!file) {
            throw new Error("file required")
        }

        await createFileOnDisk(projectId, file, allFiles)

        return {
            success: true
        }
    } catch (err) {
        console.error("createFileService failed:", {
            projectId,
            fileName: file?.name,
            error: err
        })
        throw err
    }
}

export async function updateFileService(
    projectId: string,
    file: FileNode,
    allFiles: FileNode[],
    content: string
) {
    try {
        if (!projectId) {
            throw new Error("projectId required")
        }

        await updateFileOnDisk(projectId, file, allFiles, content)

        return {
            success: true
        }
    } catch (err) {
        console.error("updateFileService failed:", {
            projectId,
            fileName: file?.name,
            error: err
        })
        throw err
    }
}

export async function readFileService(
    projectId: string,
    file: FileNode,
    allFiles: FileNode[]
) {
    try {
        const content = await readFileFromDisk(projectId, file, allFiles)

        return {
            content
        }
    } catch (err) {
        console.error("readFileService failed:", {
            projectId,
            fileName: file?.name,
            error: err
        })
        throw err
    }
}

export async function deleteFileService(
    projectId: string,
    file: FileNode,
    allFiles: Map<string, FileNode>
) {
    try {
        await deleteFileFromDisk(projectId, file, allFiles)

        return {
            success: true
        }

    } catch (err) {
        console.error("deleteFileService failed:", {
            projectId,
            fileName: file?.name,
            error: err
        })
        throw err
    }
}