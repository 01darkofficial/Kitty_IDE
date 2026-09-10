"use client"

import { Calendar, Clock3, FolderTree, FileText, Globe, Lock, Package, Server, } from "lucide-react"
import { FileNode, Project } from "@/types/db"

interface ProjectSnapshotProps {
    project: Project
    files: FileNode[]
}

export default function ProjectSnapshot({ project, files }: ProjectSnapshotProps) {

    const folderCount = files.filter(f => f.type === "folder").length
    const fileCount = files.filter(f => f.type === "file").length
    const hasReadme = files.some(file => file.name.toLowerCase() === "readme.md")

    const items = [
        {
            icon: project.runtime === "node" ? Server : Package,
            label: "Runtime",
            value: project.runtime === "node" ? "Node.js" : "Static"
        },

        {
            icon: project.visibility === "public" ? Globe : Lock,
            label: "Visibility",
            value: project.visibility === "public" ? "Public" : "Private"
        },

        ...(project.runtime === "node" ? [{
            icon: Server,
            label: "Environment",
            value: `NODE ${project.runtime_env?.node} | PNPM ${project.runtime_env?.pnpm}`,
        }] : []),

        {
            icon: FileText,
            label: "Files",
            value: fileCount.toString()
        },

        {
            icon: FolderTree,
            label: "Folders",
            value: folderCount.toString()
        },

        {
            icon: FileText,
            label: "README",
            value: hasReadme ? "Present" : "Not Found"
        },

        {
            icon: Calendar,
            label: "Created",
            value: new Date(project.created_at).toLocaleDateString(),
        },

        {
            icon: Clock3,
            label: "Updated",
            value: project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "-"
        }
    ]

    return (

        <section className="flex h-auto lg:h-110 flex-col rounded-sm border border-outline bg-surface p-5 sm:p-6">
            <h2 className="mb-6 text-base font-semibold text-foreground">
                Project Snapshot
            </h2>

            <div className="space-y-5">
                {items.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-3" >
                        <div className="flex items-center gap-3 text-foreground-muted">
                            <Icon size={16} />

                            <span className="text-sm">
                                {label}
                            </span>
                        </div>

                        <span className="text-sm font-medium text-foreground text-right">
                            {value}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    )
}