"use client"

import { useMemo } from "react"
import ProjectCard from "./ProjectCard"
import { useRouter } from "next/navigation"
import { useProjectStore } from "@/store/projectStore"

export default function RecentProjects() {

    const projectMap = useProjectStore((state) => state.projects)
    const projectIds = useProjectStore((s) => s.projectIds)
    const loading = useProjectStore((state) => state.loading)

    const projects = useMemo(() => {
        return projectIds.map(id => projectMap[id])
    }, [projectIds, projectMap])

    const recentProjects = useMemo(() => {
        return [...projects].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 3)
    }, [projects]);

    const router = useRouter();

    function handleOpenProject(projectId: string) {
        router.push(`/app/projects/${projectId}`)
    }

    function handleViewAll() {
        router.push("/app/projects")
    }

    return (
        <section className="mt-10 lg:mt-14">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Recent Projects
                    </h2>

                    <p className="mt-1 text-sm text-foreground-subtle">
                        Continue working where you left off.
                    </p>
                </div>

                {projects.length > 0 && (
                    <button
                        className="hidden lg:block md:block rounded-sm border border-outline bg-surface px-4 py-2 text-sm font-medium text-foreground transition-normal hover:bg-surface-hover cursor-pointer"
                        onClick={handleViewAll}
                    >
                        View All
                    </button>
                )}
            </div>

            {loading && (
                <div className="rounded-md border border-outline bg-surface p-6 text-sm text-foreground-subtle">
                    Loading projects...
                </div>
            )}

            {!loading && recentProjects.length === 0 && (
                <div className="rounded-md border border-dashed border-outline bg-surface p-10 text-center">
                    <h3 className="text-base font-medium text-foreground">
                        No projects yet
                    </h3>

                    <p className="mt-2 text-sm text-foreground-subtle">
                        Create your first project using the quick actions above.
                    </p>
                </div>
            )}

            {!loading && recentProjects.length > 0 && (
                <>
                    <div className="space-y-3 lg:space-y-4">
                        {recentProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                name={project.name}
                                updatedAt={project.created_at}
                                onClick={() => handleOpenProject(project.id)}
                            />
                        ))}

                    </div>

                    <div className="mt-6 lg:hidden md:hidden">
                        <button
                            onClick={handleViewAll}
                            className="w-full rounded-sm border border-outline bg-surface px-4 py-3 text-sm font-medium text-foreground transition-normal hover:bg-surface-hover cursor-pointer"
                        >
                            View All Projects
                        </button>
                    </div>
                </>
            )}
        </section>
    )
}