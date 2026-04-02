import fs from "fs/promises"
import { buildFileMap, resolveSafePath } from "./pathUtils"
import { FileNode } from "../types/db"

export async function readFileFromDisk(
    projectId: string,
    file: FileNode,
    allFiles: FileNode[]
) {

    const fileMap = buildFileMap(allFiles)
    const { safePath } = resolveSafePath(projectId, file, fileMap)
    const content = await fs.readFile(safePath, "utf-8")

    return content

}