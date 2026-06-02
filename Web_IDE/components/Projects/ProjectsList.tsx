import ProjectCard from "./ProjectCard";
import EmptyProjects from "./EmptyProjects";
import { useProjectStore } from "@/store/projectStore";

interface Props {
    onCreate: () => void;
}

export default function ProjectsList({ onCreate }: Props) {

    const projectIds = useProjectStore(s => s.projectIds)
    const projects = useProjectStore(s => s.projects)
    const projectList = projectIds.map(id => projects[id])

    if (projectList.length === 0) {
        return (
            <EmptyProjects onCreateClick={onCreate} />
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectList.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
}