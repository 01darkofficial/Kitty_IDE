"use client"

import { ExplorerAction } from "@/types/components/ide"
import TreeNode from "./TreeNode"
import { injectCreatingNode } from "./treeUtils"
import { useExplorerStore } from "@/store/explorerStore"
import { FileNode } from "@/types/db"
import { TreeNode as TreeNodeModel } from "@/lib/fileSystem/buildTree"

interface FileTreeProps {
    nodes: TreeNodeModel[]
    onSelect: (node: FileNode) => void
    onAction: (action: ExplorerAction, node: TreeNodeModel) => void
    onCreateInline: (name: string | null) => void
    onRenameSubmit: (nodeId: string, newName: string) => void
}

export default function FileTree({
    nodes,
    onSelect,
    onAction,
    onCreateInline,
    onRenameSubmit,
}: FileTreeProps) {

    const creatingNode = useExplorerStore(s => s.creatingNode)
    const setRenamingId = useExplorerStore(s => s.setRenamingNode)

    function handleAction(action: ExplorerAction, node: TreeNodeModel) {

        if (action === "rename") {
            setRenamingId(node.id)
            return
        }
        onAction(action, node)
    }

    const nodesWithInline = injectCreatingNode(nodes, creatingNode)

    return (
        <div className="text-sm">
            {nodesWithInline.map(
                (node: TreeNodeModel) => (
                    <TreeNode
                        key={node.id}
                        node={node}
                        depth={0}
                        onSelect={onSelect}
                        onAction={handleAction}
                        onCreateInline={onCreateInline}
                        onRenameSubmit={onRenameSubmit}

                    />
                )
            )}
        </div>
    )

}