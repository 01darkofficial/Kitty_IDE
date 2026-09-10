import { FolderPlus, GitBranch } from "lucide-react"

interface EmptyProjectsProps {
    onCreateClick: () => void
    onCloneClick?: () => void
}

export default function EmptyProjects({ onCreateClick, onCloneClick }: EmptyProjectsProps) {
    return (
        <div className="flex flex-col items-center rounded-sm border border-dashed border-outline bg-surface px-8 py-20 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-sm bg-canvas border border-outline">
                <FolderPlus size={30} className="text-foreground-muted" />
            </div>

            <h2 className="text-xl font-semibold text-foreground">
                No projects yet
            </h2>

            <p className="mt-3 max-w-md text-sm text-foreground-muted">
                Create a new workspace or clone an existing repository to start building.
            </p>

            <div className="mt-8 flex gap-3">
                <button
                    onClick={onCreateClick}
                    className="rounded-sm bg-neutral-900 px-5 py-3 text-sm font-medium text-white"
                >
                    New Project
                </button>

                <button
                    onClick={onCloneClick}
                    className="flex items-center gap-2 rounded-sm border border-outline bg-surface px-5 py-3 text-sm font-medium text-foreground"
                >
                    <GitBranch size={16} />

                    Clone Repository
                </button>
            </div>
        </div>
    )
}