"use client"

import { Button } from "@/components/shadcn/ui/button"
import { Plus } from "lucide-react"

interface Props {
    onCreate: () => void
}

export default function ProjectsHeader({ onCreate }: Props) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-2xl font-semibold mb-2">Projects</h1>
                <p className="text-sm text-muted-foreground">
                    Manage and organize your development projects
                </p>
            </div>

            <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
            </Button>
        </div>
    )
}