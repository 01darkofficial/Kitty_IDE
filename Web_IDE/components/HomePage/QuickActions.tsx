import { GitBranch, Plus, Upload, } from "lucide-react"
import QuickActionCard from "./QuickActionCard"

interface QuickActionsProps {
    onCreate: () => void
    onImport: () => void
    onClone: () => void
}

export default function QuickActions({ onCreate, onImport, onClone }: QuickActionsProps) {

    const actions = [
        {
            label: "New Project",
            description: "Create a new cloud workspace",
            icon: Plus,
            onClick: onCreate,
        },
        {
            label: "Import Project",
            description: "Import a project from a ZIP file",
            icon: Upload,
            onClick: onImport
        },
        {
            label: "Clone repository",
            description: "Clone a remote Git repository",
            icon: GitBranch,
            onClick: onClone
        },
    ]

    return (
        <section className="mt-10 lg:mt-14">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                    Quick Actions
                </h2>

                <p className="mt-1 text-sm text-foreground-subtle">
                    Common tasks to help you get started quickly.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {actions.map((action) => (
                    <QuickActionCard
                        key={action.label}
                        icon={action.icon}
                        label={action.label}
                        description={action.description}
                        onClick={action.onClick}
                    />
                ))}
            </div>
        </section>
    )
}