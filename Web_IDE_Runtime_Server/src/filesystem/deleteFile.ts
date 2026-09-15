import fs from "fs/promises"
import { buildFileMap, resolveSafePath } from "./pathUtils"
import { FileNode } from "../types/db"

export async function deleteFilesFromDisk(
    projectId: string,
    fileIds: string[],
    allFiles: FileNode[]
) {
    const fileMap = buildFileMap(allFiles)
    const files = fileIds.map((id) => fileMap.get(id)).filter(Boolean) as FileNode[]
    const idSet = new Set(fileIds)

    const rootTargets = files.filter((file) => {
        return !file.parent_id || !idSet.has(file.parent_id)
    })

    for (const file of rootTargets) {
        await deleteFileFromDisk(projectId, file, fileMap)
    }
}

export async function deleteFileFromDisk(
    projectId: string,
    file: FileNode,
    fileMap: Map<string, FileNode>
) {

    const { safePath } = resolveSafePath(projectId, file, fileMap)

    try {
        await fs.rm(safePath,
            {
                recursive: true,
                force: true
            }
        )
    } catch (err: any) {
        if (err.code !== "ENOENT") {
            throw err
        }
    }
}