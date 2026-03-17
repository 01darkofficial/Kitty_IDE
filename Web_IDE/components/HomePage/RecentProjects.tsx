"use client"

import { useEffect, useState } from "react"
import ProjectCard from "./ProjectCard"

type Project = {
    id: string
    name: string
    created_at: string
}

export default function RecentProjects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadProjects() {
            try {
                const res = await fetch("/api/projects", {
                    method: "GET",
                    credentials: "include",
                })

                if (!res.ok) {
                    throw new Error(`Request failed: ${res.status}`)
                }

                const data = await res.json()
                setProjects(data.projects ?? [])
            } catch (err: any) {
                console.error("Project fetch error:", err)
                setError("Failed to load projects.")
            } finally {
                setLoading(false)
            }
        }

        loadProjects()
    }, [])

    return (
        <div className="flex flex-col mb-12">
            <h2 className="text-lg font-medium mb-4">
                Recent Projects
            </h2>

            {loading && (
                <div className="text-neutral-500">
                    Loading Projects...
                </div>
            )}

            {!loading && error && (
                <div className="text-red-500">
                    {error}
                </div>
            )}

            {!loading && !error && projects.length === 0 && (
                <div className="text-neutral-500">
                    No projects yet. Create your first project.
                </div>
            )}

            {!loading && !error && projects.length > 0 && (
                <div className="flex gap-6 flex-wrap">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            name={project.name}
                            lastOpened={project.created_at}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}