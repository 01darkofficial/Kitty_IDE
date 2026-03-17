
import Link from "next/link"
import { Project } from "@/types/project"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/shadcn/ui/card"

interface Props {
    project: Project
}

export default function ProjectCard({ project }: Props) {
    return (
        <Link href={`/app/projects/${project.id}`}>

            <Card className="cursor-pointer hover:bg-muted/40 transition-colors bg-zinc-900">
                <CardHeader>
                    <CardTitle>{project.name}</CardTitle>

                    <CardDescription>
                        {project.description || "No description provided"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <p className="text-xs text-muted-foreground">
                        Created: {new Date(project.created_at).toLocaleDateString()}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}