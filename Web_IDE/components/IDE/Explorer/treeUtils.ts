import { TreeNode } from "@/lib/fileSystem/buildTree"
import { FileType } from "@/types/components/ide"
import { FileNode } from "@/types/db"

export const CREATING_ID = "__creating__"

export function injectCreatingNode(
    nodes: TreeNode[],
    creatingNode: { parentId: string | null, type: FileType } | null
) {

    if (!creatingNode) return nodes

    const newNode = {
        id: CREATING_ID,
        name: "",
        type: creatingNode.type,
        parentId: creatingNode.parentId,
        children: []
    }

    function walk(list: any[]): any[] {

        if (creatingNode?.parentId === null) {
            return [newNode, ...list]
        }

        return list.map(node => {
            if (node.id === creatingNode?.parentId) {

                return {
                    ...node,
                    children: [newNode, ...(node.children ?? [])]
                }
            }

            return {
                ...node,
                children: walk(node.children ?? [])
            }
        })
    }
    return walk(nodes)
}

/*
Deep clone subtree
*/

export function cloneSubtree(
    nodeId: string,
    files: FileNode[],
    newParentId: string | null
) {

    const result: FileNode[] = []

    function clone(id: string, parentId: string | null) {

        const node = files.find(f => f.id === id)

        if (!node) return

        const newId = crypto.randomUUID()
        const cloned = {
            ...node,
            id: newId,
            parent_id: parentId
        }

        result.push(cloned)

        files.filter(f =>
            f.parent_id === id
        ).forEach(child =>
            clone(child.id, newId)
        )
    }
    clone(nodeId, newParentId)
    return result

}