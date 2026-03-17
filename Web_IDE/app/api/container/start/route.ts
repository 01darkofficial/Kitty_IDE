// import { NextResponse } from "next/server"
import { runtimeMap } from "@/lib/docker/runtimeMap"
import {
    startProjectContainer,
    getContainerPort
} from "@/lib/docker/containerManager"

export async function POST(req: Request) {

    const { projectId } = await req.json()

    const container = await startProjectContainer(projectId)

    const port = await getContainerPort(container.id)

    runtimeMap.set(projectId, Number(port))

    return Response.json({
        previewUrl: `/preview/${projectId}`
    })
}