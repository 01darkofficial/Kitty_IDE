import IDELayout from "@/components/IDE/IDELayout"
import { getProject, getProjectFiles } from "@/lib/api/projects/project"

import { FileNode } from "@/types/db"
import { Project } from "@/types/db"

export default async function EditorPage({
    params,
}: {
    params: Promise<{ projectId: string }>
}) {

    const { projectId } = await params

    const project: Project =
        await getProject(projectId)

    const files: FileNode[] =
        await getProjectFiles(projectId)

    /*
      Start runtime via proxy
      ONLY for Node projects
    */

    if (project.runtime === "node") {
        const projectRuntimeEnv = project.runtime_env
        console.log(project)

        try {

            await fetch(
                "http://localhost:4000/runtime/start",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        projectId,
                        projectRuntimeEnv,
                        files
                    })
                }
            )

        } catch (err) {

            console.error(
                "Failed to start runtime:",
                err
            )

        }
    }

    return (
        <IDELayout
            project={project}
            files={files ?? []}
        />
    )
}