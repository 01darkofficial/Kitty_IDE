import fs from "fs/promises"
import path from "path"

export interface RuntimeVersion {

    node: string
    pnpm: string
    label: string

}

export interface RuntimeRegistry {

    default: string
    versions: RuntimeVersion[]

}

export async function loadRuntimeRegistry():
    Promise<RuntimeRegistry> {

    const filePath =
        path.join(
            process.cwd(),
            "..",
            "runtimeImages",
            "node",
            "versions.json"
        )

    const raw =
        await fs.readFile(
            filePath,
            "utf-8"
        )

    const registry =
        JSON.parse(raw)

    return registry

}