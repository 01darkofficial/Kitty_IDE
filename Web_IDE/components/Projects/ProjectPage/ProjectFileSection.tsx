"use client"

import { FolderTree } from "lucide-react"
import { buildTree } from "@/lib/fileSystem/buildTree"
import { FileNode } from "@/types/db"
import TreeNode from "./TreeNode"

interface ProjectFileSectionProps {
    files: FileNode[];
}

export default function ProjectFileSection({ files }: ProjectFileSectionProps) {

    const tree = buildTree(files);
    const fileCount = files.filter((f) => f.type === "file").length;

    return (

        <section className="flex min-h-105 lg:h-110 flex-col overflow-hidden rounded-sm border border-outline bg-surface">
            <div className="flex items-center justify-between border-b border-outline px-4 py-4 sm:px-5">
                <div className="flex items-center gap-3">
                    <FolderTree size={18} className="text-foreground-muted" />

                    <div>
                        <h2 className="font-medium text-foreground">
                            Project Structure
                        </h2>

                        <p className="mt-1 text-xs text-foreground-subtle">
                            {fileCount} files
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                {tree.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-foreground-subtle">
                        No files found.
                    </div>
                ) : (
                    tree.map((node) => (
                        <TreeNode key={node.id} node={node} />
                    ))
                )}
            </div>
        </section>
    )
}