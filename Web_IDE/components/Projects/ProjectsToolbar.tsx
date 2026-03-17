"use client"

import { Input } from "@/components/shadcn/ui/input"
import { Grid3X3, List } from "lucide-react"
import { Button } from "@/components/shadcn/ui/button"

export default function ProjectsToolbar({
    search,
    setSearch,
    viewMode,
    setViewMode
}: any) {

    return (
        <div className="flex items-center justify-between gap-4">

            <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />

            <div className="flex gap-2">

                <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                >
                    <Grid3X3 size={16} />
                </Button>

                <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                >
                    <List size={16} />
                </Button>

            </div>

        </div>
    )
}