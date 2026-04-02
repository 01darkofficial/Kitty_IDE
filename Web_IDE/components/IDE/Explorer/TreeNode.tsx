"use client"

import { ChevronRight, Folder, FolderOpen } from "lucide-react"
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/shadcn/ui/context-menu"
import { motion, AnimatePresence } from "framer-motion"
import { getFileIcon } from "@/lib/fileSystem/getFileIcon"
import InlineInput from "./InlineInput"
import { CREATING_ID } from "./treeUtils"
import { useExplorerStore } from "@/store/explorerStore"
import { ExplorerAction, } from "@/types/components/ide"
import { TreeNode as TreeNodeModel } from "@/lib/fileSystem/buildTree"

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
                        layout
                        whileHover={{
                            backgroundColor: "rgba(63,63,70,0.6)"
                        }}
                        whileTap={{
                            scale: 0.98
                        }}
                        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors
                                ${isSelected ? "bg-zinc-800" : ""}`
                        }
                        style={{
                            paddingLeft: depth * 12
                        }}
                        onClick={() => {
                            onSelect(node)
                            if (isFolder) {
                                toggleFolder(node.id)
                            }
                        }}
                    >
                        {/* Chevron */}
                        <motion.div
                            animate={{
                                rotate: isFolder && isOpen ? 90 : 0
                            }}
                            className="w-4 flex justify-center"
                        >
                            {isFolder
                                ? <ChevronRight size={14} />
                                : <span className="w-3.5" />
                            }
                        </motion.div>
                        {/* Icon */}
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
                        {/* Name */}
                        <span className="truncate">
                            {node.name}
                        </span>
                    </motion.div>
                </ContextMenuTrigger>

                {/* Context Menu */}

                <ContextMenuContent className="w-48">
                    {isFolder && (
                        <>
                            <ContextMenuItem
                                onClick={() =>
                                    onAction("new-file", node)
                                }
                            >
                                New File
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() =>
                                    onAction("new-folder", node)
                                }
                            >
                                New Folder
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                        </>
                    )}
                    <ContextMenuItem
                        onClick={() =>
                            onAction("copy", node)
                        }
                    >
                        Copy
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() =>
                            onAction("cut", node)
                        }
                    >
                        Cut
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() =>
                            onAction("paste", node)
                        }
                    >
                        Paste
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onClick={() =>
                            onAction("rename", node)
                        }
                    >
                        Rename
                    </ContextMenuItem>
                    <ContextMenuItem
                        className="text-red-500"
                        onClick={() =>
                            onAction("delete", node)
                        }
                    >
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {/* Children */}

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
                        className="ml-4"
                    >
                        {(node.children ?? []).map(
                            (child: any) => (

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