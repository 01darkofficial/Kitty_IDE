import { Button } from "@/components/shadcn/ui/button"
import { FolderPlus } from "lucide-react"

interface Props {
    onCreateClick: () => void
}

export default function EmptyProjects({ onCreateClick }: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">

            <FolderPlus className="h-12 w-12 text-muted-foreground mb-4" />

            <h2 className="text-lg font-medium">
                No projects found
            </h2>

            <p className="text-sm text-muted-foreground mb-4">
                Create your first project to get started
            </p>

            <Button onClick={onCreateClick}>
                Create Project
            </Button>

        </div>
    )
}