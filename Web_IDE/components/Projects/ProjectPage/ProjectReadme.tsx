"use client"

import { FileText } from "lucide-react"

interface ProjectReadmeProps { readme?: string | null }

export default function ProjectReadme({ readme }: ProjectReadmeProps) {

    return (
        <section className="overflow-hidden rounded-sm border border-outline bg-surface">
            <div className="flex items-center gap-3 border-b border-outline px-5 py-4">
                <FileText size={18} className="text-foreground-muted" />

                <div>
                    <h2 className="font-medium text-foreground">
                        README.md
                    </h2>

                    <p className="mt-1 text-xs text-foreground-subtle">
                        Project documentation
                    </p>
                </div>
            </div>

            <div className="min-h-65 p-5 sm:p-6">
                {readme ? (
                    <article className="prose prose-sm max-w-none">
                        {readme}
                    </article>
                ) : (
                    <div className="flex h-full min-h-55 flex-col items-center justify-center text-center">

                        <FileText size={36} className="mb-4 text-foreground-subtle" />

                        <h3 className="text-base font-medium text-foreground">
                            No README found
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-foreground-subtle">
                            Add a README.md file to document your project,
                            setup instructions, and usage.
                        </p>
                    </div>
                )}
            </div>
        </section>
    )
}