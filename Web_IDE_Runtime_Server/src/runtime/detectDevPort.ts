import { runtimeMap, previewReadyMap } from "./runtimeMap"
import { resolveContainerAddress } from "./resolveContainerAddress"

export async function detectDevPort(
    projectId: string,
    text: string
): Promise<void> {

    if (previewReadyMap.get(projectId)) {
        return
    }

    const cleaned = text.replace(/\x1B\[[0-9;]*[A-Za-z]/g, "")
    const match = cleaned.match(/(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/)

    if (!match) return

    const containerPort = Number(match[2])

    try {

        const { host, port } = await resolveContainerAddress(projectId, containerPort)

        runtimeMap.set(projectId, { host, port })
        previewReadyMap.set(projectId, true)

        console.log(`Mapped ${host}:${port}`)
        console.log("runtimeMap entry:", runtimeMap.get(projectId))

    } catch (err) {
        console.error(
            "resolveContainerAddress FAILED:",
            containerPort,
            err
        )

    }
}

export function rewritePreviewURL(
    projectId: string,
    text: string
): string {

    return text.replace(
        /http:\/\/localhost:\d+/,
        `http://localhost:4000/preview/${projectId}`
    )

}