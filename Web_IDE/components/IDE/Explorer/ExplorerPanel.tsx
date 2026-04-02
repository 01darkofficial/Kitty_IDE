"use client"

import FileTree from "./FileTree"
import { FilePlus, FolderPlus, RefreshCcw } from "lucide-react"
import { Button } from "@/components/shadcn/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadcn/ui/tooltip"
import { buildTree } from "@/lib/fileSystem/buildTree"
import { useExplorerStore } from "@/store/explorerStore"
import { ExplorerAction, FileType } from "@/types/components/ide"
import { FileNode } from "@/types/db"

interface ExplorerPanelProps {
    files: FileNode[]
    onSelect: (file: FileNode) => void
    onAction: (action: ExplorerAction, file: FileNode | null) => void
    onCreateInline: (name: string | null) => void
    onSelectRoot: () => void
    onRenameSubmit: (fileId: string, newName: string) => void
}

export default function ExplorerPanel({
    files,
    onSelect,
    onAction,
    onCreateInline,
    onSelectRoot,
    onRenameSubmit
}: ExplorerPanelProps) {

    const tree = buildTree(files)
    const setCreatingNode = useExplorerStore(s => s.setCreatingNode)
    const activeContainerId = useExplorerStore(s => s.activeContainerId)

    return (
        <div className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                <span className="text-xs uppercase text-zinc-400">
                    Explorer
                </span>
                <div className="flex gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                    setCreatingNode({
                                        parentId:
                                            activeContainerId,
                                        type: "file"
                                    })
                                }
                            >
                                <FilePlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            New File
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"

                                onClick={() =>
                                    setCreatingNode({
                                        parentId:
                                            activeContainerId,
                                        type: "folder"
                                    })
                                }
                            >
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            New Folder
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                    onAction(
                                        "refresh",
                                        null
                                    )
                                }
                            >
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh</TooltipContent>
                    </Tooltip>
                </div>
            </div>
            {/* Tree */}
            <div
                className="flex-1 overflow-auto"
                onClick={(e) => {
                    if (
                        e.target ===
                        e.currentTarget
                    ) {
                        onSelectRoot()
                    }
                }}
            >
                <FileTree
                    nodes={tree}
                    onSelect={onSelect}
                    onAction={onAction}
                    onCreateInline={onCreateInline}
                    onRenameSubmit={onRenameSubmit}
                />
            </div>
        </div>
    )
}