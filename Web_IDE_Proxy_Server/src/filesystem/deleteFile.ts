import fs from "fs/promises"
import { resolveSafePath } from "./pathUtils"
import { FileNode } from "../types/db"

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