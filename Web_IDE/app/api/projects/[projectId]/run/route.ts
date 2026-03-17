import { startProjectContainer } from "@/lib/docker/containerManager"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {

    const { projectId } = await params

    await startProjectContainer(projectId)

    return Response.json({ started: true })
}