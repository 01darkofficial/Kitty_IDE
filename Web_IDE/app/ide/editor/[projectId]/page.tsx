
import IDELayout from "@/components/IDE/IDELayout"
import { getProject, getProjectFiles } from "@/lib/api/projects/project"
import { FileNode } from "@/types/db";
import { Project } from "@/types/db";

export default async function EditorPage({
    params,
}: {
    params: Promise<{ projectId: string }>
}) {
    const { projectId } = await params;

    const project: Project = await getProject(projectId);

    const files: FileNode[] = await getProjectFiles(projectId)

    return <IDELayout project={project} files={files ?? []} />
}