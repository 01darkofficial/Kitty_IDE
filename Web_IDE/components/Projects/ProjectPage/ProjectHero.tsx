"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, Clock3, Globe, Lock, Package, Play, Server, } from "lucide-react"
import { Button } from "@/components/shadcn/ui/button"
import { Project } from "@/types/db"

interface ProjectHeroProps {
    project: Project
    onOpenEditor: () => void
}

export default function ProjectHero({ project, onOpenEditor }: ProjectHeroProps) {

    return (
        <section className="rounded-sm border border-outline bg-surface p-5 sm:p-6 lg:p-8">
            <Link
                href="/app/projects"
                className="inline-flex items-center gap-2 text-sm text-foreground-subtle transition-colors hover:text-foreground"
            >
                <ArrowLeft size={16} />

                Projects
            </Link>

            <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="wrap-break-words text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                        {project.name}
                    </h1>

                    {/* {project.description && (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground-muted">
                            {project.description}
                        </p>
                    )} */}

                    <div className="mt-6 flex flex-wrap gap-3">
                        <div className="inline-flex items-center gap-2 rounded border border-outline bg-canvas px-3 py-1.5 text-sm text-foreground-muted">
                            {project.runtime === "node" ? <Server size={15} /> : <Package size={15} />}

                            {project.runtime === "node" ? "Node.js" : "Static"}
                        </div>

                        <div className="inline-flex items-center gap-2 rounded border border-outline bg-canvas px-3 py-1.5 text-sm text-foreground-muted">
                            {project.visibility === "public" ? <Globe size={15} /> : <Lock size={15} />}

                            {project.visibility === "public" ? "Public" : "Private"}
                        </div>

                        {project.runtime === "node" && project.runtime_env && (
                            <div className="inline-flex items-center gap-2 rounded border border-outline bg-canvas px-3 py-1.5 text-sm text-foreground-muted">
                                <Server size={15} />

                                Node {project.runtime_env.node}
                            </div>
                        )}

                        {project.runtime === "node" && project.runtime_env && (
                            <div className="inline-flex items-center gap-2 rounded border border-outline bg-canvas px-3 py-1.5 text-sm text-foreground-muted">
                                <Package size={15} />

                                pnpm {project.runtime_env.pnpm}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 text-sm text-foreground-subtle sm:flex-row sm:flex-wrap sm:gap-6">
                        <div className="flex items-center gap-2">
                            <Calendar size={15} />

                            Created{" "}

                            {new Date(project.created_at).toLocaleDateString()}
                        </div>

                        {project.updated_at && (
                            <div className="flex items-center gap-2">
                                <Clock3 size={15} />

                                Updated{" "}

                                {new Date(project.updated_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    size="lg"
                    onClick={onOpenEditor}
                    className="h-11 w-full rounded-sm bg-neutral-900 cursor-pointer text-neutral-0 sm:w-auto lg:shrink-0"
                >
                    <Play
                        size={16}
                        className="mr-2"
                    />

                    Open IDE
                </Button>
            </div>
        </section>
    )
}