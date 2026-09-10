export default function EditorLayout({ children }: {
    children: React.ReactNode
}) {
    return (
        <div className="relative h-dvh w-dvw overflow-hidden bg-zinc-950">
            <div className="absolute inset-0 z-999 hidden items-center justify-center bg-zinc-950 px-6 text-center text-zinc-100 max-md:portrait:flex">
                <div className="max-w-xs">
                    <div className="mb-5 text-4xl">
                        ↻
                    </div>

                    <h1 className="text-lg font-semibold">
                        Rotate your device
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Kitty IDE requires landscape orientation
                        on smaller screens.
                    </p>
                </div>
            </div>

            <div className="h-full w-full">
                {children}
            </div>
        </div>
    )
}