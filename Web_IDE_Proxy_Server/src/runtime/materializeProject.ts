import fs from "fs/promises"
import path from "path"
import { FileNode } from "../types/db"

export async function materializeProject(projectId: string, files: FileNode[]) {

    const workspace = `/home/wizard/Desktop/cloud-ide-runtime/projects/${projectId}`
    await fs.rm(workspace, { recursive: true, force: true })

    await fs.mkdir(workspace, { recursive: true })

    const fileMap = new Map()

    for (const f of files) {
        fileMap.set(f.id, f)
    }

    function buildPath(file: any) {

        const parts = [file.name]

        let parent = file.parent_id

        while (parent) {
            const p = fileMap.get(parent)
            if (!p) break
            parts.unshift(p.name)
            parent = p.parent_id
        }

        return parts.join("/")
    }

    for (const file of files) {

        if (file.type !== "file") continue

        const relativePath = buildPath(file)
        const fullPath = path.join(workspace, relativePath)

        await fs.mkdir(path.dirname(fullPath), { recursive: true })
        await fs.writeFile(fullPath, file.content || "")
    }

    return workspace
}