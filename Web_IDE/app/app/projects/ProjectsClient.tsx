"use client"

import { useState } from "react"
import { Project } from "@/types/project"
import ProjectsHeader from "../../../components/Projects/ProjectsHeader"
import ProjectsList from "../../../components/Projects/ProjectsList"
import CreateProjectDialog from "../../../components/Projects/CreateProjectDialog"

interface Props {
    projects: Project[]
}

export default function ProjectsClient({ projects }: Props) {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto px-8 py-10">
            <ProjectsHeader onCreate={() => setOpen(true)} />
            <ProjectsList projects={projects} onCreate={() => setOpen(true)} />

            <CreateProjectDialog
                open={open}
                onOpenChange={setOpen}
            />
        </div>
    )
}