import fs from "fs/promises"
import { buildFileMap, resolveSafePath } from "./pathUtils"
import { FileNode } from "../types/db"

export async function updateFileOnDisk(
    projectId: string,
    file: FileNode,
    allFiles: FileNode[],
    content: string
) {

    const fileMap = buildFileMap(allFiles)
    const { safePath } = resolveSafePath(projectId, file, fileMap)

    await fs.writeFile(safePath, content, "utf-8")

}