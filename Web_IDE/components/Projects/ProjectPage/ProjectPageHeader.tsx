import { Button } from "@/components/shadcn/ui/button"

export default function ProjectPageHeader({ project, onOpenEditor }: any) {
    return (
        <div className="flex items-center justify-between">

            <div>
                <h1 className="text-2xl font-semibold text-zinc-100">
                    {project.name}
                </h1>

                <p className="text-sm text-zinc-400">
                    {project.description}
                </p>
            </div>

            <Button onClick={onOpenEditor}>
                Open in IDE
            </Button>

        </div>
    )
}