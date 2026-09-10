import EmptyProjects from "./EmptyProjects"
import ProjectCard from "./ProjectCard"
import { useProjectStore } from "@/store/projectStore"
import ProjectsSkeleton from "./ProjectSkeleton"

interface ProjectsListProps {
    onCreate: () => void
}

export default function ProjectsList({ onCreate }: ProjectsListProps) {

    const loading = useProjectStore((s) => s.loading)
    const projectIds = useProjectStore((s) => s.projectIds)
    const projects = useProjectStore((s) => s.projects)
    const initialized = useProjectStore((s) => s.initializedForUserId)

    if (!initialized) {
        return <ProjectsSkeleton />
    }

    if (loading) {
        return <ProjectsSkeleton />
    }

    const projectList = projectIds.map((id) => projects[id]).filter(Boolean)

    if (projectList.length === 0) {
        return (
            <EmptyProjects onCreateClick={onCreate} />
        );
    }

    return (
        <section>
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-foreground-muted">
                    {projectList.length}{" "}
                    {projectList.length === 1 ? "project" : "projects"}
                </p>

                <button className="self-start text-sm font-medium text-foreground-muted transition-colors hover:text-foreground lg:self-auto">
                    Sort by Recent
                </button>
            </div>

            <div className="grid lg:gap-4 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                {projectList.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </section>
    )
}