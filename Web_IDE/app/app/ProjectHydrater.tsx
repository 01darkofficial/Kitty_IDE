"use client"

import { useEffect } from "react"
import { useProjectStore } from "@/store/projectStore"
import { Project } from "@/types/db"

interface ProjectHydraterProps {
    userId: string
    projects: Project[]
}

export default function ProjectHydrator({ userId, projects }: ProjectHydraterProps) {
    const hydrateProjects = useProjectStore(s => s.hydrateProjects)
    const initialized = useProjectStore(s => s.initializedForUserId)

    useEffect(() => {
        if (!initialized) {
            hydrateProjects(userId, projects)
        }
    }, [initialized, projects, hydrateProjects])

    return null
}