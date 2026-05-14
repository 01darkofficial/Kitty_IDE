import fs from "fs/promises"
import docker from "../runtime/docker"

import {
    runtimeMap,
    previewReadyMap
} from "../runtime/runtimeMap"

import {
    lastUsedMap
} from "../runtime/activity"

export async function deleteProjectService(
    projectId: string
) {

    const containerName =
        `project-${projectId}`

    console.log(
        "Deleting project runtime:",
        projectId
    )

    /*
    STEP 1 — Stop & Remove Container
    */

    try {

        const container = docker.getContainer(containerName)

        try {

            const info = await container.inspect()

            if (info.State.Running) {

                console.log("Stopping container: ", containerName)

                await container.stop()

            }

            console.log(
                "Removing container:",
                containerName
            )

            await container.remove({
                force: true
            })

        }
        catch (err: any) {

            if (err.statusCode !== 404) {

                throw err

            }

            console.log(
                "Container not found:",
                containerName
            )

        }

    }
    catch (err) {

        console.error(
            "Container removal failed:",
            err
        )

        throw err

    }

    /*
    STEP 2 — Delete Workspace
    */

    const workspace =
        `/var/lib/cloud-ide/projects/${projectId}`

    try {

        console.log(
            "Deleting workspace:",
            workspace
        )

        await fs.rm(
            workspace,
            {
                recursive: true,
                force: true
            }
        )

    }
    catch (err) {

        console.error(
            "Workspace removal failed:",
            err
        )

        throw err

    }

    /*
    STEP 3 — Clear Runtime Memory
    */

    runtimeMap.delete(projectId)

    previewReadyMap.delete(projectId)

    lastUsedMap.delete(projectId)

    console.log("Runtime memory cleared: ", projectId)

    return {
        success: true
    }

}