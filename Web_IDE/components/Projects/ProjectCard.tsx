"use client"

import Link from "next/link"
import { useState } from "react"
import { Project } from "@/types/db"
import { Card, CardHeader, CardTitle, CardContent, } from "@/components/shadcn/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu"
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
import { MoreVertical, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useProjectStore } from "@/store/projectStore"

interface Props {
    project: Project
}

export default function ProjectCard({ project }: Props) {

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const deleteProject = useProjectStore(s => s.deleteProject)

    /*
    Open delete dialog
    */

    function openDeleteDialog(
        e: React.MouseEvent
    ) {

        e.preventDefault()
        e.stopPropagation()

        setConfirmOpen(true)

    }

    /*
    Delete project handler
    */

    async function handleDelete() {

        if (isDeleting) return

        try {
            setIsDeleting(true)
            await deleteProject(project.id)
            toast.success("Project deleted")
        }
        catch (err) {
            toast.error("Failed to delete project")
        }
        finally {

            setIsDeleting(false)
            setConfirmOpen(false)

        }

    }

    return (

        <>
            <Link href={`/app/projects/${project.id}`}>

                <Card className="relative cursor-pointer hover:bg-muted/40 transition-colors bg-zinc-900">

                    {/* Top-right menu */}

                    <div className="absolute top-2 right-2 z-10">

                        <DropdownMenu>

                            <DropdownMenuTrigger asChild>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </Button>

                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                            >

                                <DropdownMenuItem
                                    onClick={openDeleteDialog}
                                    className="text-red-500 focus:text-red-500"
                                >

                                    <Trash2 className="w-4 h-4 mr-2" />

                                    Delete

                                </DropdownMenuItem>

                            </DropdownMenuContent>

                        </DropdownMenu>

                    </div>

                    <CardHeader>

                        <CardTitle>
                            {project.name}
                        </CardTitle>

                    </CardHeader>

                    <CardContent>

                        <p className="text-xs text-muted-foreground">

                            Created:{" "}

                            {new Date(
                                project.created_at
                            ).toLocaleDateString()}

                        </p>

                    </CardContent>

                </Card>

            </Link>

            {/* Delete Confirmation Dialog */}

            <AlertDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
            >

                <AlertDialogContent>

                    <AlertDialogHeader>

                        <AlertDialogTitle>

                            Delete Project

                        </AlertDialogTitle>

                        <AlertDialogDescription>

                            This action cannot be undone.
                            This will permanently delete{" "}

                            <strong>
                                {project.name}
                            </strong>{" "}

                            and all its files.

                        </AlertDialogDescription>

                    </AlertDialogHeader>

                    <AlertDialogFooter>

                        <AlertDialogCancel>

                            Cancel

                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >

                            {isDeleting
                                ? "Deleting..."
                                : "Delete"}

                        </AlertDialogAction>

                    </AlertDialogFooter>

                </AlertDialogContent>

            </AlertDialog>

        </>
    )

}