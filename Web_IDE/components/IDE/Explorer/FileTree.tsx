"use client"

import { useState } from "react"
import { ChevronRight, Folder, FolderOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getFileIcon } from "@/lib/fileSystem/getFileIcon"

export default function FileTree({ nodes, onSelect, selectedNodeId }: any) {

    return (
        <div className="text-sm">
            {nodes.map((node: any) => (
                <TreeNode
                    key={node.id}
                    node={node}
                    onSelect={onSelect}
                    selectedNodeId={selectedNodeId}
                />
            ))}
        </div>
    )
}

function TreeNode({ node, onSelect, selectedNodeId }: any) {

    const [open, setOpen] = useState(false)

    const isSelected = node.id === selectedNodeId
    const isFolder = node.type === "folder"

    return (
        <div>

            {/* File Row */}
            <motion.div
                layout
                variants={{
                    open: { opacity: 1, y: 0 },
                    collapsed: { opacity: 0, y: -4 }
                }}
                whileHover={{ backgroundColor: "rgba(63,63,70,0.6)" }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer
                ${isSelected ? "bg-zinc-800" : ""}
                `}
                onClick={() => {
                    onSelect(node)

                    if (isFolder) {
                        setOpen(!open)
                    }
                }}
            >

                {/* Chevron */}
                <motion.div
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={{ duration: 0.18 }}
                    className="w-4 flex justify-center"
                >
                    {isFolder ? (
                        <ChevronRight size={14} />
                    ) : (
                        <span className="w-3.5" />
                    )}
                </motion.div>

                {/* Icon */}
                <div className="w-5 flex items-center justify-center">
                    {isFolder ? (
                        <AnimatePresence mode="wait" initial={false}>
                            {open ? (
                                <motion.div
                                    key="open"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    transition={{ duration: 0.1, ease: "easeOut" }}
                                >
                                    <FolderOpen size={16} className="text-yellow-400" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="closed"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    transition={{ duration: 0.1, ease: "easeOut" }}
                                >
                                    <Folder size={16} className="text-yellow-500" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        getFileIcon(node.name)
                    )}

                </div>

                {/* Name */}
                <span className="truncate">
                    {node.name}
                </span>

            </motion.div>


            {/* Children */}
            <AnimatePresence initial={false}>

                {isFolder && open && node.children.length > 0 && (

                    <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: {
                                height: "auto",
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.03
                                }
                            },
                            collapsed: {
                                height: 0,
                                opacity: 0
                            }
                        }}
                        transition={{
                            duration: 0.22,
                            ease: "easeInOut"
                        }}
                        className="ml-4 overflow-hidden"
                    >

                        {node.children.map((child: any) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                onSelect={onSelect}
                                selectedNodeId={selectedNodeId}
                            />
                        ))}

                    </motion.div>

                )}

            </AnimatePresence>

        </div>
    )
}