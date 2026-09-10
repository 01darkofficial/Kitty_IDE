"use client"

import { useState } from "react"
import { ChevronRight, Folder, FolderOpen } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { getFileIcon } from "@/lib/fileSystem/getFileIcon"
import { TreeNode as Node } from "@/lib/fileSystem/buildTree"

interface TreeNodeProps {
    node: Node
    depth?: number
}

export default function TreeNode({ node, depth = 0 }: TreeNodeProps) {

    const [open, setOpen] = useState(false)
    const isFolder = node.type === "folder"

    function toggle() {
        if (isFolder) {
            setOpen((prev) => !prev)
        }
    }

    return (
        <div>
            <div
                onClick={toggle}
                style={{
                    paddingLeft: `${depth * 14 + 8}px`,
                }}
                className={cn(
                    "group flex min-h-10 cursor-pointer select-none items-center gap-2 rounded px-2",
                    "transition-colors duration-150",
                    "hover:bg-surface-hover"
                )}
            >
                <div className="flex w-4 justify-center">
                    {isFolder && (
                        <motion.div
                            animate={{ rotate: open ? 90 : 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <ChevronRight size={14} className="text-foreground-subtle" />
                        </motion.div>

                    )}
                </div>

                <div className="flex h-6 w-6 items-center justify-center">
                    {isFolder ? (
                        open ? (
                            <FolderOpen size={17} className="text-foreground" />
                        ) : (
                            <Folder size={17} className="text-foreground-muted" />
                        )
                    ) : (
                        getFileIcon(node.name)
                    )}
                </div>

                <span className="min-w-0 break-all text-sm text-foreground-muted transition-colors group-hover:text-foreground">
                    {node.name}
                </span>
            </div>

            <AnimatePresence initial={false}>
                {open && node.children?.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                    >
                        {node.children.map((child: any) => (
                            <TreeNode key={child.id} node={child} depth={depth + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}