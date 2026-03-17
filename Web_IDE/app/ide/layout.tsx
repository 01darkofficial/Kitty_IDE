export default function IDELayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen w-screen bg-zinc-950">
            {children}
        </div>
    )
}