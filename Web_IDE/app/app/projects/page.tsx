
import ProjectsClient from "@/app/app/projects/ProjectsClient";
import { Project } from "@/types/db";
import { getProjects } from "@/lib/api/projects/project";
import { getUser } from "@/lib/api/user/user";

export default async function ProjectsPage() {

    const user = await getUser();

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">
                    You must be logged in to view projects.
                </p>
            </div>
        )
    }

    const projects = await getProjects(user.id);

    return (
        <ProjectsClient projects={(projects ?? []) as Project[]} />
    )
}