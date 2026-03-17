import { buildTree } from "@/lib/fileSystem/buildTree"
import TreeNode from "./TreeNode"
import { FileNode } from "@/types/db"

export default function ProjectFileSection({ files }: { files: FileNode[] }) {

    const tree = buildTree(files)

    return (
        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900 flex flex-col h-full">

            <div className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
                Files
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto py-3 px-2 no-scrollbar">

                {tree.map((node) => (
                    <TreeNode key={node.id} node={node} />
                ))}

            </div>

        </div>
    )
}