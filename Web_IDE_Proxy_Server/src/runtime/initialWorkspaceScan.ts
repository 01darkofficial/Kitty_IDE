import fs from "fs/promises"
import path from "path"

const ROOT =
    process.env.MAINROOT ??
    "/var/lib/cloud-ide/projects"

const API_URL =
    process.env.API_URL ??
    "http://localhost:3000"

export async function initialWorkspaceScan(
    projectId: string
) {

    const workspace =
        path.join(ROOT, projectId)

    console.log(
        "Initial scan:",
        workspace
    )

    const entriesToCreate: {
        relative: string
        type: "file" | "folder"
    }[] = []

    async function walk(dir: string) {

        const entries =
            await fs.readdir(
                dir,
                { withFileTypes: true }
            )

        for (const entry of entries) {

            /*
            Ignore heavy folders
            */

            if (
                entry.name === "node_modules" ||
                entry.name === ".git" ||
                entry.name === ".pnpm"
            ) continue

            const fullPath =
                path.join(dir, entry.name)

            const relative =
                path.relative(
                    workspace,
                    fullPath
                )

            const type =
                entry.isDirectory()
                    ? "folder"
                    : "file"

            entriesToCreate.push({
                relative,
                type
            })

            if (entry.isDirectory()) {

                await walk(fullPath)

            }

        }

    }

    await walk(workspace)

    /*
    Send batch
    */

    await fetch(
        `${API_URL}/api/internal/files/create`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                projectId,
                entries: entriesToCreate
            })
        }
    )

}

export async function shouldRunInitialScan(
    projectId: string
) {

    try {

        const res =
            await fetch(
                `${API_URL}/api/internal/files/count?projectId=${projectId}`
            )

        const data =
            await res.json()

        console.log(
            "Scan check → project:",
            projectId,
            "count:",
            data.count
        )

        // return false

        return data.count === 0

    } catch (err) {

        console.error(
            "shouldRunInitialScan failed:",
            err
        )

        return false

    }

}
