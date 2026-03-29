"use client"

import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
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

    const slug =
        name
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") || ""

    /**
     * Reset runtime_env when switching to static
     */
    useEffect(() => {

        if (runtime === "static") {

            setShowAdvanced(false)

            setValue("runtime_env", {
                node: "25",
                pnpm: "10"
            })

        }

    }, [runtime, setValue])

    const onSubmit = async (values: ProjectForm) => {

        try {

            setLoading(true)

            /**
             * If runtime is static → runtime_env must be null
             */
            const payload = {
                ...values,
                name: slug,
                runtime_env:
                    values.runtime === "node"
                        ? values.runtime_env
                        : null
            }

            const res = await fetch("/api/projects", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(payload),

            })

            if (!res.ok) {

                throw new Error("Project creation failed")

            }

            const data = await res.json()

            onOpenChange(false)

            router.push(`/app/projects/${data.project.id}`)

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

            <DialogContent className="sm:max-w-lg bg-zinc-900">

                <DialogHeader>

                    <DialogTitle>
                        Create New Project
                    </DialogTitle>

                    <DialogDescription>
                        Select a template to start your project.
                    </DialogDescription>

                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6 py-4"
                >

                    {/* Project Name */}

                    <div className="space-y-2">

                        <Label>
                            Project Name
                        </Label>

                        <Input
                            {...register("name")}
                            placeholder="my-project"
                        />

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

                    {/* Runtime */}

                    <div className="space-y-2">

                        <Label>
                            Runtime
                        </Label>

                        <Select
                            defaultValue="static"

                            onValueChange={(v) =>
                                setValue(
                                    "runtime",
                                    v as ProjectForm["runtime"]
                                )
                            }
                        >

                            <SelectTrigger>

                                <SelectValue />

                            </SelectTrigger>

                            <SelectContent>

                                <SelectItem value="static">
                                    Static
                                </SelectItem>

                                <SelectItem value="node">
                                    Node
                                </SelectItem>

                            </SelectContent>

                        </Select>

                    </div>

                    {/* Advanced (ONLY FOR NODE) */}

                    {runtime === "node" && (

                        <div>

                            <button
                                type="button"

                                onClick={() =>
                                    setShowAdvanced(!showAdvanced)
                                }

                                className="flex items-center text-sm text-muted-foreground"
                            >

                                <ChevronDown
                                    className={`mr-1 h-4 w-4 transition-transform ${showAdvanced
                                        ? "rotate-180"
                                        : ""
                                        }`}
                                />

                                Advanced Settings

                            </button>

                            {showAdvanced && (

                                <div className="mt-4 space-y-4 border-t pt-4">

                                    {/* Runtime Environment */}

                                    <div className="space-y-4">

                                        {/* Node Version */}

                                        <div className="space-y-2">

                                            <Label>
                                                Node Version
                                            </Label>

                                            <Select
                                                defaultValue="25"

                                                onValueChange={(v) =>
                                                    setValue(
                                                        "runtime_env.node",
                                                        v
                                                    )
                                                }
                                            >

                                                <SelectTrigger>

                                                    <SelectValue />

                                                </SelectTrigger>

                                                <SelectContent>

                                                    <SelectItem value="25">
                                                        Node 25 (latest)
                                                    </SelectItem>

                                                    <SelectItem value="24">
                                                        Node 24 (LTS)
                                                    </SelectItem>

                                                    <SelectItem value="20">
                                                        Node 20
                                                    </SelectItem>

                                                    <SelectItem value="18">
                                                        Node 18
                                                    </SelectItem>

                                                </SelectContent>

                                            </Select>

                                        </div>

                                        {/* pnpm Version */}

                                        <div className="space-y-2">

                                            <Label>
                                                pnpm Version
                                            </Label>

                                            <Select
                                                defaultValue="10"

                                                onValueChange={(v) =>
                                                    setValue(
                                                        "runtime_env.pnpm",
                                                        v
                                                    )
                                                }
                                            >

                                                <SelectTrigger>

                                                    <SelectValue />

                                                </SelectTrigger>

                                                <SelectContent>

                                                    <SelectItem value="10">
                                                        pnpm 10 (latest)
                                                    </SelectItem>

                                                    <SelectItem value="9">
                                                        pnpm 9
                                                    </SelectItem>

                                                    <SelectItem value="8">
                                                        pnpm 8
                                                    </SelectItem>

                                                </SelectContent>

                                            </Select>

                                        </div>

                                    </div>

                                    {/* Visibility */}

                                    <div className="flex items-center justify-between">

                                        <Label>
                                            Public Project
                                        </Label>

                                        <Switch

                                            onCheckedChange={(checked) =>

                                                setValue(
                                                    "visibility",

                                                    checked
                                                        ? "public"
                                                        : "private"
                                                )
                                            }

                                        />

                                    </div>

                                </div>

                            )}

                        </div>

                    )}

                    <DialogFooter>

                        <Button
                            type="button"
                            variant="ghost"

                            onClick={() =>
                                onOpenChange(false)
                            }
                        >

                            Cancel

                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating..."
                                : "Create Project"}

                        </Button>

                    </DialogFooter>

                </form>

            </DialogContent>

        </Dialog>

    )

}