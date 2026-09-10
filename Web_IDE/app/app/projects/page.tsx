
import ProjectsClient from "@/app/app/projects/ProjectsClient"
import { getUser } from "@/lib/api/user/user"

export default async function ProjectsPage() {

    const user = await getUser()

    if (!user) {
        return (
            <div className="mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 lg:px-8 lg:pt-10 lg:pb-10">
                <p className="text-muted-foreground">
                    You must be logged in to view projects.
                </p>
            </div>
        )
    }

    return (
        <ProjectsClient />
    )
}