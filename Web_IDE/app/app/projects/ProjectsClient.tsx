"use client"

import { useEffect, useState } from "react"
import { Project } from "@/types/db"
import ProjectsHeader from "../../../components/Projects/ProjectsHeader"
import ProjectsList from "../../../components/Projects/ProjectsList"
import CreateProjectDialog from "../../../components/Projects/CreateProjectDialog"
import { useProjectStore } from "@/store/projectStore"

interface Props {
    projects: Project[]
}

export default function ProjectsClient({ projects }: Props) {
    const [open, setOpen] = useState(false)

    const hydrateProjects = useProjectStore(s => s.hydrateProjects)

    useEffect(() => {
        hydrateProjects(projects)
    }, [projects, hydrateProjects])

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto px-8 py-10">
            <ProjectsHeader onCreate={() => setOpen(true)} />
            <ProjectsList onCreate={() => setOpen(true)} />

            <CreateProjectDialog
                open={open}
                onOpenChange={setOpen}
            />
        </div>
    )
}