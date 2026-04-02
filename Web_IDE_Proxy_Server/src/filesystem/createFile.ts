import fs from "fs/promises"
import path from "path"
import { buildFileMap, resolveSafePath } from "./pathUtils"
import { FileNode } from "../types/db"

export async function createFileOnDisk(
    projectId: string,
    file: FileNode,
    allFiles: FileNode[]
) {

    const fileMap = buildFileMap(allFiles)
    const { workspace, safePath } = resolveSafePath(projectId, file, fileMap)

    await fs.mkdir(workspace, { recursive: true })
    await fs.mkdir(path.dirname(safePath), { recursive: true })

    if (file.type === "file") {
        try {
            await fs.access(safePath)
        } catch {
            await fs.writeFile(safePath, "")
        }
    } else {
        await fs.mkdir(safePath, { recursive: true })
    }
}