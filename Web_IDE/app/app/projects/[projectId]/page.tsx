
import { FileNode, Project } from "@/types/db"
import ProjectClient from "./ProjectPageClient"
import { getProject, getProjectFiles } from "@/lib/api/projects/project"

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ projectId: string }>
}) {

    const { projectId } = await params;

    const project: Project = await getProject(projectId);
    const files: FileNode[] = await getProjectFiles(projectId);


    return (
        <ProjectClient
            project={project}
            files={files ?? []}
        />
    )
}