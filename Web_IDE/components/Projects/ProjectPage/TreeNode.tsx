"use client"

import { useState } from "react"
import { Folder, ChevronRight, FolderOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getFileIcon } from "@/lib/fileSystem/getFileIcon"

export default function TreeNode({ node, depth = 0 }: any) {

    const [open, setOpen] = useState(false)

    const toggle = () => {
        if (node.type === "folder") {
            setOpen(!open)
        }
    }

    return (
        <div>

            {/* Row */}
            <motion.div
                layout
                variants={{
                    open: { opacity: 1, y: 0 },
                    collapsed: { opacity: 0, y: -4 }
                }}
                onClick={toggle}
                className="flex items-center gap-2 h-9 hover:bg-zinc-800 cursor-pointer select-none text-base text-zinc-200"
                style={{ paddingLeft: `${depth * 14 + 8}px` }}
            >

                {/* Chevron */}
                <motion.div
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 flex justify-center"
                >
                    {node.type === "folder" && <ChevronRight size={14} />}
                </motion.div>

                {/* Icon */}
                <div className="w-6 flex items-center justify-center">

                    {node.type === "folder"
                        ? (open
                            ? <FolderOpen size={18} className="text-yellow-400" />
                            : <Folder size={18} className="text-yellow-500" />
                        )
                        : getFileIcon(node.name)
                    }

                </div>

                {/* Name */}
                <span className="truncate">{node.name}</span>

            </motion.div>


            {/* Children */}
            <AnimatePresence initial={false}>

                {open && node.children?.length > 0 && (

                    <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
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
                        className="overflow-hidden"
                    >

                        {node.children.map((child: any) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                depth={depth + 1}
                            />
                        ))}

                    </motion.div>

                )}

            </AnimatePresence>

        </div>
    )
}