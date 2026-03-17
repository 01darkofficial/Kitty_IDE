"use client"

import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { projectSchema } from "@/lib/validation/project"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/shadcn/ui/dialog"

import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"
import { Button } from "@/components/shadcn/ui/button"

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/shadcn/ui/select"

import { Switch } from "@/components/shadcn/ui/switch"
import { ChevronDown } from "lucide-react"

type ProjectForm = z.infer<typeof projectSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function CreateProjectDialog({
    open,
    onOpenChange,
}: Props) {
    const router = useRouter()
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProjectForm>({
        resolver: zodResolver(projectSchema as any),
        defaultValues: {
            template: "browser_vanilla",
            language: "javascript",
            visibility: "private",
        },
    })

    const name = watch("name")

    const slug =
        name
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") || ""

    const onSubmit = async (values: ProjectForm) => {
        try {
            setLoading(true)

            const res = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    name: slug,
                }),
            })

            if (!res.ok) {
                throw new Error("Project creation failed")
            }

            const data = await res.json()

            onOpenChange(false)
            router.push(`/app/projects/${data.project.id}`)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-zinc-900">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Select a template to start your project.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">

                    {/* Project Name */}
                    <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input {...register("name")} placeholder="my-project" />

                        {slug && (
                            <p className="text-xs text-muted-foreground">
                                Slug: {slug}
                            </p>
                        )}

                        {errors.name && (
                            <p className="text-xs text-red-500">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Template */}
                    <div className="space-y-2">
                        <Label>Template</Label>

                        <Select
                            defaultValue="browser_vanilla"
                            onValueChange={(v) =>
                                setValue("template", v as ProjectForm["template"])
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="empty">Empty</SelectItem>
                                <SelectItem value="browser_vanilla">Browser (Vanilla JS)</SelectItem>
                                <SelectItem value="browser_canvas">Canvas Starter</SelectItem>
                                <SelectItem value="node_basic">Node Script</SelectItem>
                                <SelectItem value="node_express">Express API</SelectItem>
                                <SelectItem value="vite_vanilla">Vite Vanilla</SelectItem>
                            </SelectContent>
                        </Select>

                        {errors.template && (
                            <p className="text-xs text-red-500">
                                {errors.template.message}
                            </p>
                        )}
                    </div>

                    {/* Advanced */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center text-sm text-muted-foreground"
                        >
                            <ChevronDown
                                className={`mr-1 h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""
                                    }`}
                            />
                            Advanced Settings
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 space-y-4 border-t pt-4">

                                {/* Language */}
                                <div className="space-y-2">
                                    <Label>Language</Label>

                                    <Select
                                        defaultValue="javascript"
                                        onValueChange={(v) =>
                                            setValue("language", v as ProjectForm["language"])
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="javascript">
                                                JavaScript
                                            </SelectItem>

                                            <SelectItem value="typescript">
                                                TypeScript
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Visibility */}
                                <div className="flex items-center justify-between">
                                    <Label>Public Project</Label>

                                    <Switch
                                        onCheckedChange={(checked) =>
                                            setValue(
                                                "visibility",
                                                checked ? "public" : "private"
                                            )
                                        }
                                    />
                                </div>

                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    )
}