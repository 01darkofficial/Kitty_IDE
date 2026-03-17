"use client"

export default function Error({
    error,
}: {
    error: Error
}) {
    return (
        <div className="p-6">
            <p className="text-destructive">
                Failed to load projects: {error.message}
            </p>
        </div>
    )
}