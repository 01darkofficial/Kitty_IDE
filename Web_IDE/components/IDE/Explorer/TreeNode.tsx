"use client"

import { ChevronRight, Folder, FolderOpen, FilePlus, FolderPlus, Copy, Scissors, ClipboardPaste, Pencil, Trash2, } from "lucide-react"
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/shadcn/ui/context-menu"
import { motion, AnimatePresence } from "framer-motion"
import { getFileIcon } from "@/lib/fileSystem/getFileIcon"
import InlineInput from "./InlineInput"
import { CREATING_ID } from "./treeUtils"
import { useExplorerStore } from "@/store/explorerStore"
import { ExplorerAction, } from "@/types/components/ide"
import { TreeNode as TreeNodeModel } from "@/lib/fileSystem/buildTree"
import { cn } from "@/lib/utils"

interface TreeNodeProps {
    node: TreeNodeModel
    depth: number
    onSelect: (node: TreeNodeModel) => void
    onAction: (action: ExplorerAction, node: TreeNodeModel) => void
    onCreateInline: (name: string | null) => void
    onRenameSubmit: (nodeId: string, newName: string) => void
}

export default function TreeNode({
    node,
    depth,
    onSelect,
    onAction,
    onCreateInline,
    onRenameSubmit
}: TreeNodeProps) {

    const openFolders = useExplorerStore(s => s.openFolders)
    const toggleFolder = useExplorerStore(s => s.toggleFolder)
    const selectedNodeId = useExplorerStore(s => s.selectedNodeId)
    const renamingId = useExplorerStore(s => s.renamingNodeId)
    const setRenamingId = useExplorerStore(s => s.setRenamingNode)

    const isCreating = node.id === CREATING_ID
    const isRenaming = node.id === renamingId
    const isFolder = node.type === "folder"
    const isOpen = openFolders.has(node.id)
    const isSelected = node.id === selectedNodeId

    /*
    ============================
    INLINE CREATE
    ============================
    */

    if (isCreating) {
        return (
            <InlineInput
                depth={depth}
                onSubmit={(name: string) => onCreateInline(name)}
                onCancel={() => onCreateInline(null)}
            />
        )
    }

    /*
    ============================
    RENAME MODE
    ============================
    */

    if (isRenaming) {
        return (
            <InlineInput
                depth={depth}
                initialName={node.name}
                onSubmit={(name: string) => {
                    onRenameSubmit(node.id, name)
                    setRenamingId(null)
                }}
                onCancel={() =>
                    setRenamingId(null)
                }
            />
        )

    }

    /*
    ============================
    NORMAL NODE
    ============================
    */

    return (
        <div>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <motion.div
                        whileHover={{
                            backgroundColor: "rgba(63,63,70,0.6)"
                        }}
                        whileTap={{
                            scale: 0.99
                        }}
                        className={cn(
                            "group flex items-center gap-2 px-2 py-1.5 rounded-xsm cursor-pointer transition-colors",
                            isSelected ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800/70 hover:text-white"
                        )}
                        style={{
                            paddingLeft: depth * 14 + 8
                        }}
                        onClick={() => {
                            onSelect(node)
                            if (isFolder) {
                                toggleFolder(node.id)
                            }
                        }}
                    >
                        <motion.div
                            animate={{
                                rotate: isFolder && isOpen ? 90 : 0
                            }}
                            className="w-4 flex justify-center"
                        >
                            {isFolder ? <ChevronRight size={14} /> : <span className="w-3.5" />
                            }
                        </motion.div>

                        <div className="w-5 flex items-center justify-center">
                            {isFolder ? isOpen
                                ? (
                                    <FolderOpen
                                        size={16}
                                        className="text-yellow-400"
                                    />
                                )
                                : (
                                    <Folder
                                        size={16}
                                        className="text-yellow-500"
                                    />
                                )
                                : getFileIcon(node.name)
                            }
                        </div>

                        <span className="min-w-0 flex-1 truncate">
                            {node.name}
                        </span>
                    </motion.div>
                </ContextMenuTrigger>

                <ContextMenuContent
                    alignOffset={4}
                    className="w-56 rounded-sm border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl animate-fade-in"
                >
                    {isFolder && (
                        <>
                            <ContextMenuItem
                                inset
                                onClick={() => onAction("new-file", node)}
                                className="h-8 rounded-xsm px-2 text-zinc-200 focus:bg-zinc-800 focus:text-white"
                            >
                                <FilePlus className="mr-2 h-4 w-4 text-zinc-400" />
                                New File
                            </ContextMenuItem>

                            <ContextMenuItem
                                inset
                                onClick={() => onAction("new-folder", node)}
                                className="h-8 rounded-xsm px-2 text-zinc-200 focus:bg-zinc-800 focus:text-white"
                            >
                                <FolderPlus className="mr-2 h-4 w-4 text-zinc-400" />
                                New Folder
                            </ContextMenuItem>

                            <ContextMenuSeparator className="my-1 bg-zinc-800" />
                        </>
                    )}

                    <ContextMenuItem
                        inset
                        onClick={() => onAction("copy", node)}
                        className="h-8 rounded-xsm px-2 text-zinc-200 focus:bg-zinc-800 focus:text-white"
                    >
                        <Copy className="mr-2 h-4 w-4 text-zinc-400" />
                        Copy
                    </ContextMenuItem>

                    <ContextMenuItem
                        inset
                        onClick={() => onAction("cut", node)}
                        className="h-8 rounded-xsm px-2 text-zinc-200 focus:bg-zinc-800 focus:text-white"
                    >
                        <Scissors className="mr-2 h-4 w-4 text-zinc-400" />
                        Cut
                    </ContextMenuItem>

                    <ContextMenuItem
                        inset
                        onClick={() => onAction("paste", node)}
                        className="h-8 rounded-xsm px-2 text-zinc-200 focus:bg-zinc-800 focus:text-white"
                    >
                        <ClipboardPaste className="mr-2 h-4 w-4 text-zinc-400" />
                        Paste
                    </ContextMenuItem>

                    <ContextMenuSeparator className="my-1 bg-zinc-800" />

                    <ContextMenuItem
                        inset
                        onClick={() => onAction("rename", node)}
                        className="h-8 rounded-xsm px-2 text-zinc-200 focus:bg-zinc-800 focus:text-white"
                    >
                        <Pencil className="mr-2 h-4 w-4 text-zinc-400" />
                        Rename
                    </ContextMenuItem>

                    <ContextMenuItem
                        inset
                        onClick={() => onAction("delete", node)}
                        className="h-8 rounded-xsm px-2 text-red-400 focus:bg-red-500/10 focus:text-red-400"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <AnimatePresence>
                {isFolder && isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            height: 0
                        }}
                        animate={{
                            opacity: 1,
                            height: "auto"
                        }}
                        exit={{
                            opacity: 0,
                            height: 0
                        }}
                        className="overflow-hidden"
                    >
                        {(node.children ?? []).map(
                            (child: TreeNodeModel) => (
                                <TreeNode
                                    key={child.id}
                                    node={child}
                                    depth={depth + 1}
                                    onSelect={onSelect}
                                    onAction={onAction}
                                    onCreateInline={onCreateInline}
                                    onRenameSubmit={onRenameSubmit}
                                />
                            )
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}