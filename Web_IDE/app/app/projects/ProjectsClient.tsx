"use client"

import { useState } from "react"
import ProjectsHeader from "../../../components/Projects/ProjectsHeader"
import ProjectsList from "../../../components/Projects/ProjectsList"
import CreateProjectDialog from "../../../components/Projects/CreateProjectDialog"

export default function ProjectsClient() {
    const [open, setOpen] = useState(false)
    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 pt-20 pb-8 sm:px-6 lg:px-8 lg:pt-10 lg:pb-10">
            <ProjectsHeader onCreate={() => setOpen(true)} />
            <ProjectsList onCreate={() => setOpen(true)} />

            <CreateProjectDialog
                open={open}
                onOpenChange={setOpen}
            />
        </div>
    )
}