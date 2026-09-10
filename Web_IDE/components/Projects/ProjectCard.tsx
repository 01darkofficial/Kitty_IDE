"use client";

import Link from "next/link";
import { useState } from "react"
import { Folder, MoreVertical, Trash2, Globe, Lock, Boxes, Server } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/shadcn/ui/dropdown-menu"
import { Project } from "@/types/db"
import { useProjectStore } from "@/store/projectStore"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/shadcn/ui/alert-dialog"
import { Button } from "@/components/shadcn/ui/button"
import { toast } from "sonner"

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const deleteProject = useProjectStore((s) => s.deleteProject)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (loading) return

        try {
            setLoading(true)
            await deleteProject(project.id)
            toast.success("Project deleted")
        } catch {
            toast.error("Failed to delete project")
        } finally {
            setLoading(false)
            setConfirmOpen(false)
        }
    }

    return (
        <>
            <Link href={`/app/projects/${project.id}`}>
                <div className="group rounded-sm border border-outline bg-surface p-5.5 transition-colors hover:bg-surface-hover">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded bg-canvas border border-outline">
                                <Folder size={20} className="text-foreground-muted" />
                            </div>

                            <div>
                                <h3 className="font-semibold text-foreground">
                                    {project.name}
                                </h3>

                                <p className="mt-1 text-xs text-foreground-subtle">
                                    Created{" "}
                                    {new Date(project.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <MoreVertical size={16} />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="rounded" align="end">
                                <DropdownMenuItem
                                    className="text-danger hover:rounded"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setConfirmOpen(true);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />

                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-canvas px-2.5 py-1 text-xs text-foreground-muted">
                            {project.runtime === "node"
                                ? (
                                    <>
                                        <Server size={12} />
                                        Node
                                    </>
                                )
                                : (
                                    <>
                                        <Boxes size={12} />
                                        Static
                                    </>
                                )}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded bg-canvas px-2.5 py-1 text-xs text-foreground-muted">
                            {project.visibility === "public"
                                ? (
                                    <>
                                        <Globe size={12} />
                                        Public
                                    </>
                                )
                                : (
                                    <>
                                        <Lock size={12} />
                                        Private
                                    </>
                                )}
                        </span>
                    </div>
                </div>
            </Link>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Project
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}