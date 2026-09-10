import { Skeleton } from "@/components/shadcn/ui/skeleton"
import { MoreVertical } from "lucide-react"

export default function ProjectsSkeleton() {
    return (
        <section>
            <div className="mb-5 flex items-center justify-between">
                <Skeleton className="h-5 w-24 rounded" />

                <Skeleton className="h-5 w-28 rounded" />
            </div>

            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-sm border border-outline bg-surface p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded border border-outline bg-canvas">
                                    <Skeleton className="h-5 w-5 rounded" />
                                </div>

                                <div>
                                    <Skeleton className="h-5 w-32 rounded" />

                                    <Skeleton className="mt-2 h-3 w-24 rounded" />
                                </div>
                            </div>

                            <MoreVertical size={16} className="text-border" />
                        </div>

                        <div className="mt-6 flex gap-2">
                            <Skeleton className="h-7 w-20 rounded" />

                            <Skeleton className="h-7 w-20 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}