export default function ProjectDetails({ project }: any) {
    return (
        <div className="border border-zinc-800 rounded-lg p-4 space-y-4 bg-zinc-900 h-full">

            <h3 className="text-sm font-medium text-zinc-200">
                Project Details
            </h3>

            <div className="text-sm text-zinc-400 space-y-2">

                <div>
                    Created: {new Date(project.created_at).toLocaleDateString()}
                </div>

                <div>
                    Project ID: {project.id}
                </div>

            </div>

        </div>
    )
}