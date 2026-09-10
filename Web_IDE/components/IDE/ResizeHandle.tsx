"use client";

import { cn } from "@/lib/utils";

interface ResizeHandleProps {
    direction: "vertical" | "horizontal"
    onMouseDown: () => void
}

export default function ResizeHandle({ direction, onMouseDown }: ResizeHandleProps) {
    return (
        <div
            onMouseDown={onMouseDown}
            className={cn(
                "group relative shrink-0 select-none",
                direction === "vertical" ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize"
            )}
        >
            <div
                className={cn(
                    "absolute transition-colors duration-100 bg-zinc-800 group-hover:bg-zinc-500",
                    direction === "vertical" ? "left-1/2 top-0 h-full w-full -translate-x-1/2" : "top-1/2 left-0 h-full w-full -translate-y-1/2"

                )}
            />
        </div>
    )
}