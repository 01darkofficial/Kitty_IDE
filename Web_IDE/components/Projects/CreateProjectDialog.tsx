"use client"

import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { projectSchema } from "@/lib/validation/project"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/shadcn/ui/dialog"
import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"
import { Button } from "@/components/shadcn/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/shadcn/ui/select"
import { useProjectStore } from "@/store/projectStore"

type ProjectForm = {
    name: string
    runtime: "static" | "node"
    visibility: "private" | "public"
    runtime_env: {
        node: string
        pnpm: string
    }
}

interface CreateProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function CreateProjectDialog({
    open,
    onOpenChange,
}: CreateProjectDialogProps) {

    const router = useRouter()

    const [showAdvanced, setShowAdvanced] = useState(false)
    const [loading, setLoading] = useState(false)
    const createProject = useProjectStore(s => s.createProject)
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProjectForm>({
        resolver: zodResolver(projectSchema as any),
        defaultValues: {
            runtime: "static",
            visibility: "private",
            runtime_env: {
                node: "25",
                pnpm: "10"
            }
        },
    })

    const name = watch("name")
    const runtime = watch("runtime")
    const visibility = watch("visibility");
    const activeCard = "border-accent bg-surface-active";
    const inactiveCard = "border-outline bg-surface hover:bg-surface-hover";

    const slug = name?.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || ""

    useEffect(() => {
        if (runtime === "static") {
            setShowAdvanced(false)
            setValue("runtime_env", { node: "25", pnpm: "10" })
        }
    }, [runtime, setValue])

    const onSubmit = async (values: ProjectForm) => {

        try {
            setLoading(true)
            const payload = values.runtime === "node" ? {
                name: slug,
                runtime: "node" as const,
                runtime_env: values.runtime_env,
                visibility: values.visibility
            } : {
                name: slug,
                runtime: "static" as const,
                visibility: values.visibility
            }

            const project = await createProject(payload)

            if (!project) {
                return
            }

            onOpenChange(false)
            router.push(`/app/projects/${project.id}`)
        }

        catch (err) {
            console.error(err)
        }

        finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-xl rounded-sm border-outline bg-surface px-0 py-2 max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto no-scrollbar sm:w-full sm:max-h-[90dvh] lg:max-h-[80dvh]">
                <DialogHeader className="px-5 pt-5 pb-2 sm:px-6 lg:px-7">
                    <DialogTitle className="text-2xl">
                        New Project
                    </DialogTitle>

                    <DialogDescription>
                        Create a new development workspace.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
                    <div className="flex-1 px-5 py-5 space-y-8 sm:px-6 lg:px-7">
                        <div className="space-y-2">
                            <Label>
                                Project Name
                            </Label>

                            <Input
                                {...register("name")}
                                placeholder="portfolio"
                                className="rounded"
                            />

                            {errors.name && (
                                <p className="text-xs text-danger">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label>
                                Runtime
                            </Label>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setValue("runtime", "static")}
                                    className={cn(
                                        "rounded border p-5 text-left transition-all duration-150",
                                        runtime === "static" ? activeCard : inactiveCard
                                    )}
                                >
                                    <h3 className="font-medium text-foreground">
                                        Static
                                    </h3>

                                    <p className="mt-1 text-sm text-foreground-subtle">
                                        HTML, CSS & JavaScript
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setValue("runtime", "node")}
                                    className={cn(
                                        "rounded border p-5 text-left transition-all duration-150",
                                        runtime === "node" ? activeCard : inactiveCard
                                    )}
                                >
                                    <h3 className="font-medium text-foreground">
                                        Node.js
                                    </h3>

                                    <p className="mt-1 text-sm text-foreground-subtle">
                                        Backend & Fullstack
                                    </p>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>
                                Visibility
                            </Label>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setValue("visibility", "private")}
                                    className={cn(
                                        "rounded border p-4 text-left transition-all duration-150",
                                        visibility === "private" ? activeCard : inactiveCard
                                    )}
                                >
                                    <h3 className="font-medium text-foreground">
                                        Private
                                    </h3>

                                    <p className="mt-1 text-sm text-foreground-subtle">
                                        Only you can access this project.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setValue("visibility", "public")}
                                    className={cn(
                                        "rounded border p-4 text-left transition-all duration-150",
                                        visibility === "public" ? activeCard : inactiveCard
                                    )}
                                >
                                    <h3 className="font-medium text-foreground">
                                        Public
                                    </h3>

                                    <p className="mt-1 text-sm text-foreground-subtle">
                                        Anyone with the link can view it.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {runtime === "node" && (

                            <div className="space-y-3">

                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex w-full items-center justify-between rounded border border-outline bg-surface px-4 py-3 transition-colors hover:bg-surface-hover"
                                >
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Advanced
                                        </p>

                                        <p className="mt-1 text-xs text-foreground-subtle">
                                            Configure the runtime environment.
                                        </p>
                                    </div>

                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 transition-transform",
                                            showAdvanced && "rotate-180"
                                        )}
                                    />
                                </button>

                                {showAdvanced && (
                                    <div className="space-y-5 rounded border border-outline bg-surface p-5">
                                        <div className="space-y-2">
                                            <Label>
                                                Node Version
                                            </Label>

                                            <Select
                                                defaultValue="25"
                                                onValueChange={(v) => setValue("runtime_env.node", v)}
                                            >
                                                <SelectTrigger className="rounded">
                                                    <SelectValue />
                                                </SelectTrigger>

                                                <SelectContent className="rounded border-outline bg-surface text-foreground shadow-lg">
                                                    <SelectItem className="hover:rounded" value="25">
                                                        Node 25 (Current)
                                                    </SelectItem>

                                                    <SelectItem className="hover:rounded" value="24">
                                                        Node 24 (LTS)
                                                    </SelectItem>

                                                    <SelectItem className="hover:rounded" value="20">
                                                        Node 20
                                                    </SelectItem>

                                                    <SelectItem className="hover:rounded" value="18">
                                                        Node 18
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>
                                                pnpm Version
                                            </Label>

                                            <Select
                                                defaultValue="10"
                                                onValueChange={(v) => setValue("runtime_env.pnpm", v)}
                                            >
                                                <SelectTrigger className="rounded">
                                                    <SelectValue />
                                                </SelectTrigger>

                                                <SelectContent className="rounded border-outline bg-surface text-foreground shadow-lg">
                                                    <SelectItem className="hover:rounded" value="10">
                                                        pnpm 10
                                                    </SelectItem>

                                                    <SelectItem className="hover:rounded" value="9">
                                                        pnpm 9
                                                    </SelectItem>

                                                    <SelectItem className="hover:rounded" value="8">
                                                        pnpm 8
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t border-outline px-5 py-4 sm:px-6 flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-11 w-full rounded-sm border-outline bg-surface text-foreground hover:bg-surface-hover sm:w-auto sm:min-w-28"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-11 w-full rounded-sm bg-neutral-900 text-neutral-0 hover:bg-neutral-800-active disabled:bg-neutral-900-hover disabled:text-neutral-400 sm:w-auto sm:min-w-36"
                        >
                            {loading ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}