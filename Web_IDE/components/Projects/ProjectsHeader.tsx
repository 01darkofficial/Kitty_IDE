"use client"

import { Plus, GitBranch } from "lucide-react"
import { Button } from "@/components/shadcn/ui/button"

interface ProjectsHeaderProps {
    onCreate: () => void
    onClone?: () => void
}

export default function ProjectsHeader({ onCreate, onClone }: ProjectsHeaderProps) {
    return (
        <header className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-start lg:justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                    Projects
                </h1>

                <p className="mt-2 text-sm text-foreground-muted">
                    Manage your development workspaces.
                </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <Button
                    variant="outline"
                    onClick={onClone}
                    className="rounded-sm cursor-pointer h-11 w-full sm:w-auto border-outline bg-surface hover:bg-surface-hover"
                >
                    <GitBranch className="mr-2 h-4 w-4" />

                    Clone Repository
                </Button>

                <Button
                    onClick={onCreate}
                    className="rounded-sm cursor-pointer h-11 w-full sm:w-auto bg-neutral-900 text-white hover:opacity-90"
                >
                    <Plus className="mr-2 h-4 w-4" />

                    New Project
                </Button>
            </div>
        </header>
    )
}