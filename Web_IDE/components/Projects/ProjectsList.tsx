import { Project } from "@/types/db";
import ProjectCard from "./ProjectCard";
import EmptyProjects from "./EmptyProjects";

interface Props {
    projects: Project[];
    onCreate: () => void;
}

export default function ProjectsList({ projects, onCreate }: Props) {
    if (!projects || projects.length === 0) {
        return (
            <EmptyProjects onCreateClick={onCreate} />
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
}