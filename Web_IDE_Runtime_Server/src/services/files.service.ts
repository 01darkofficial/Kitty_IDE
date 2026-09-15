import docker from "../runtime/docker"
import { parseLsOutput } from "../filesystem/parseLsOutput"
import { createFileOnDisk } from "../filesystem/createFile"
import { updateFileOnDisk } from "../filesystem/updateFile"
import { readAllFilesFromDisk, readFileFromDisk } from "../filesystem/readFile"
import { deleteFileFromDisk, deleteFilesFromDisk } from "../filesystem/deleteFile"
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
    fileId: string,
    allFiles: FileNode[],
    content: string
) {
    try {
        if (!projectId) {
            throw new Error("projectId required")
        }

        await updateFileOnDisk(projectId, fileId, allFiles, content)

        return {
            success: true
        }
    } catch (err) {
        console.error("updateFileService failed:", {
            projectId,
            fileId,
            error: err
        })
        throw err
    }
}

export async function readFileService(
    projectId: string,
    fileId: string,
    allFiles: FileNode[]
) {
    try {
        const content = await readFileFromDisk(projectId, fileId, allFiles)

        return {
            content
        }
    } catch (err) {
        console.error("readFileService failed:", {
            projectId,
            fileId,
            error: err
        })
        throw err
    }
}

export async function readAllFilesService(
    projectId: string,
    allFiles: FileNode[]
) {
    try {

        const files = await readAllFilesFromDisk(
            projectId,
            allFiles
        )

        return { files }

    } catch (err) {

        console.error("readAllFilesService failed:", {
            projectId,
            error: err,
        })

        throw err
    }
}

export async function deleteFileService(
    projectId: string,
    fileIds: string[],
    allFiles: FileNode[]
) {
    try {
        await deleteFilesFromDisk(projectId, fileIds, allFiles)

        return {
            success: true
        }

    } catch (err) {
        console.error("deleteFileService failed:", {
            projectId,
            fileIds,
            error: err
        })
        throw err
    }
}