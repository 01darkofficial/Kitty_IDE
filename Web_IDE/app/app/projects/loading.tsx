import { Skeleton } from "@/components/shadcn/ui/skeleton"

export default function Loading() {
    return (
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-8 py-10">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
        </div>
    )
}