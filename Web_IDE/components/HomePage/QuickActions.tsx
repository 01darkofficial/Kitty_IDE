import { Plus, Upload, LayoutTemplate } from "lucide-react"
import QuickActionCard from "./QuickActionCard"
import { createProject } from "@/lib/api/projects/createProject"

export default function QuickActions({
    onProjectCreated
}: {
    onProjectCreated: () => void
}) {

    async function handleCreateProject() {

        const name =
            prompt("Enter project name")

        if (!name) return

        await createProject(name)

        onProjectCreated()
    }

    const actions = [
        {
            label: "New Project",
            icon: Plus,
        },
        {
            label: "Import Project",
            icon: Upload,
        },
        {
            label: "Templates",
            icon: LayoutTemplate,
        },
    ]

    return (
        <section className="mb-12">

            <h2 className="text-lg font-medium mb-4">
                Quick Actions
            </h2>

            <div className="flex gap-6 flex-wrap">

                {actions.map(action => (
                    action.label == "New Project" ? (
                        <QuickActionCard
                            key={action.label}
                            icon={action.icon}
                            label={action.label}
                            onClick={onProjectCreated}
                        />
                    ) : (
                        <QuickActionCard
                            key={action.label}
                            icon={action.icon}
                            label={action.label}
                        />
                    )
                ))}

            </div>

        </section>
    )
}