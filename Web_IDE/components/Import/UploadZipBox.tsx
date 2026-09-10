"use client";

import { useRef, useState } from "react"
import { Archive, CircleCheck, FolderOpen, RefreshCw } from "lucide-react"
import { Button } from "@/components/shadcn/ui/button"
import { cn } from "@/lib/utils"

type UploadZipBoxProps = {
    file: File | null
    setFile: React.Dispatch<React.SetStateAction<File | null>>
    projectType: "node" | "static"
}

export default function UploadZipBox({
    file,
    setFile,
    projectType
}: UploadZipBoxProps) {

    const inputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)

    function browseFiles() {
        inputRef.current?.click()
    }

    function handleFileSelection(selected: File | undefined) {
        if (!selected) return

        if (!selected.name.endsWith(".zip")) {
            return
        }

        setFile(selected)
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        handleFileSelection(e.target.files?.[0])
    }

    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault()
        setDragging(false)
        handleFileSelection(e.dataTransfer.files?.[0])
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                hidden
                accept=".zip"
                onChange={onInputChange}
            />

            {!file ? (
                <div
                    onClick={browseFiles}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={cn(
                        "cursor-pointer rounded-sm border-2 border-dashed p-12 transition-all",
                        dragging ? "border-accent bg-surface-active" : "border-outline bg-canvas hover:border-accent hover:bg-surface-hover"
                    )}

                >
                    <div className="flex flex-col items-center text-center">
                        <Archive
                            size={42}
                            className="mb-5 text-foreground-subtle"
                        />

                        <h3 className="text-lg font-medium text-foreground">

                            Drag & Drop ZIP Archive

                        </h3>

                        <p className="mt-2 text-sm text-foreground-subtle">

                            or click anywhere to browse

                        </p>

                        <Button
                            type="button"
                            variant="outline"
                            className="mt-6"
                        >
                            <FolderOpen
                                size={16}
                                className="mr-2"
                            />

                            Choose ZIP File
                        </Button>

                        <p className="mt-5 text-xs text-foreground-subtle">
                            Supports .zip archives
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-sm border border-outline bg-canvas p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded bg-surface border border-outline">
                                <Archive
                                    size={22}
                                    className="text-accent"
                                />
                            </div>

                            <div>
                                <h3 className="font-medium text-foreground">
                                    {file.name}
                                </h3>

                                <div className="mt-3 space-y-1 text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-foreground-subtle">
                                            Size:
                                        </span>

                                        <span className="text-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <span className="text-foreground-subtle">
                                            Runtime:
                                        </span>

                                        <span className="text-foreground">
                                            {projectType === "node" ? "Node.js" : "Static"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                                    <CircleCheck size={16} />

                                    Ready to import
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={browseFiles}
                        >
                            <RefreshCw
                                size={15}
                                className="mr-2"
                            />
                            Change
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}