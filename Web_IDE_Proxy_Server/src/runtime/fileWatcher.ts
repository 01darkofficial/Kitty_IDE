import chokidar from "chokidar"
import path from "path"

const ROOT =
    process.env.MAINROOT ??
    "/var/lib/cloud-ide/projects"

const API_URL =
    process.env.API_URL ??
    "http://localhost:3000"

export function startFileWatcher(
    projectId: string
) {

    const workspace =
        path.join(ROOT, projectId)

    console.log(
        "Starting watcher:",
        workspace
    )

    /*
    Separate queues
    */

    const pendingFiles =
        new Set<string>()

    const pendingFolders =
        new Set<string>()

    const pendingDeletes =
        new Set<string>()

    let createTimer: NodeJS.Timeout
    let deleteTimer: NodeJS.Timeout

    const watcher =
        chokidar.watch(workspace, {

            ignored: [
                "**/node_modules/**",
                "**/.git/**",
                "**/.pnpm/**",
                "**/.cache/**",
                "**/dist/**",
                "**/build/**"
            ],

            ignoreInitial: true,

            persistent: true

        })

    /*
    FILE CREATED
    */

    watcher.on("add", (filePath) => {

        pendingFiles.add(filePath)

        clearTimeout(createTimer)

        createTimer = setTimeout(async () => {

            const paths =
                Array.from(pendingFiles)

            pendingFiles.clear()

            await batchCreate(
                projectId,
                paths,
                "file"
            )

        }, 300)

    })

    /*
    FOLDER CREATED
    */

    watcher.on("addDir", (dirPath) => {

        pendingFolders.add(dirPath)

        clearTimeout(createTimer)

        createTimer = setTimeout(async () => {

            const paths =
                Array.from(pendingFolders)

            pendingFolders.clear()

            await batchCreate(
                projectId,
                paths,
                "folder"
            )

        }, 300)

    })

    /*
    FILE/FOLDER DELETED
    */

    watcher.on("unlink", (filePath) => {

        pendingDeletes.add(filePath)

        clearTimeout(deleteTimer)

        deleteTimer = setTimeout(async () => {

            const paths =
                Array.from(pendingDeletes)

            pendingDeletes.clear()

            await batchDelete(
                projectId,
                paths
            )

        }, 300)

    })

    watcher.on("unlinkDir", (dirPath) => {

        pendingDeletes.add(dirPath)

        clearTimeout(deleteTimer)

        deleteTimer = setTimeout(async () => {

            const paths =
                Array.from(pendingDeletes)

            pendingDeletes.clear()

            await batchDelete(
                projectId,
                paths
            )

        }, 300)

    })

    return watcher
}

/* ------------------------ */

async function batchCreate(
    projectId: string,
    paths: string[],
    type: "file" | "folder"
) {

    const workspace =
        path.join(ROOT, projectId)

    const entries =
        paths.map(fullPath => {

            const relative =
                path.relative(
                    workspace,
                    fullPath
                )

            return {
                relative,
                type
            }

        })

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
                entries
            })
        }
    )

}

/* ------------------------ */

async function batchDelete(
    projectId: string,
    paths: string[]
) {

    try {

        await fetch(
            `${API_URL}/api/internal/files/delete`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    projectId,
                    paths
                })
            }
        )

    } catch (err) {

        console.error(
            "batchDelete failed:",
            err
        )

    }

}
