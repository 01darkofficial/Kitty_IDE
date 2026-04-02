"use client"

import { useState } from "react"

interface InlineInputProps {
    depth: number
    initialName?: string
    onSubmit: (name: string) => void
    onCancel: () => void
}

export default function InlineInput({
    depth,
    initialName = "",
    onSubmit,
    onCancel
}: InlineInputProps) {

    const [name, setName] = useState(initialName)

    function submit() {
        const trimmed = name.trim()

        if (!trimmed) onCancel()
        else onSubmit(trimmed)
    }

    return (
        <div
            className="flex items-center px-2 py-1"
            style={{
                paddingLeft: depth * 12
            }}
        >
            <input
                autoFocus
                className="bg-zinc-800 px-1 w-full outline-none"
                value={name}
                onChange={(e) =>
                    setName(e.target.value)
                }
                onKeyDown={(e) => {
                    if (e.key === "Enter") submit()

                    if (e.key === "Escape") onCancel()
                }}
                onBlur={submit}
            />
        </div>
    )
}