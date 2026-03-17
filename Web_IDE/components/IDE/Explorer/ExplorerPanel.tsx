import FileTree from "./FileTree"

import { FilePlus, FolderPlus, RefreshCcw } from "lucide-react"

import { Button } from "@/components/shadcn/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/shadcn/ui/tooltip"
import { buildTree } from "@/lib/fileSystem/buildTree"

type Props = {
    files: any
    onSelect: (file: any) => void
    selectedNodeId: string
    onNewFile: () => void
    onNewFolder: () => void
    onRefresh: () => void
}

export default function ExplorerPanel({
    files,
    onSelect,
    selectedNodeId,
    onNewFile,
    onNewFolder,
    onRefresh,
}: Props) {


    const tree = buildTree(files)

    return (
        <div className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                <span className="text-xs uppercase text-zinc-400">
                    Explorer
                </span>

                <div className="flex items-center gap-1">

                    {/* New File */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onNewFile}
                                className="h-7 w-7"
                            >
                                <FilePlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>New File</TooltipContent>
                    </Tooltip>

                    {/* New Folder */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onNewFolder}
                                className="h-7 w-7"
                            >
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>New Folder</TooltipContent>
                    </Tooltip>

                    {/* Refresh */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onRefresh}
                                className="h-7 w-7"
                            >
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh</TooltipContent>
                    </Tooltip>

                </div>
            </div>

            {/* File tree */}
            <div className="flex-1 overflow-auto">
                <FileTree nodes={tree} onSelect={onSelect} selectedNodeId={selectedNodeId} />
            </div>

        </div>
    )
}