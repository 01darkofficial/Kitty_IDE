import { FileNode } from "@/types/db"

export type TreeNode = FileNode & {
    children: TreeNode[]
}

export function buildTree(nodes: FileNode[]): TreeNode[] {
    const map = new Map<string, TreeNode>()
    const roots: TreeNode[] = []

    // create node map
    for (const n of nodes) {
        map.set(n.id, { ...n, children: [] })
    }

    // attach children
    for (const n of nodes) {
        const node = map.get(n.id)!

        if (n.parent_id) {
            const parent = map.get(n.parent_id)

            if (parent) parent.children.push(node)
            else roots.push(node)
        } else {
            roots.push(node)
        }
    }

    // sort entire tree
    sortNodes(roots)

    return roots
}

function sortNodes(nodes: TreeNode[]) {

    nodes.sort((a, b) => {

        // folders first
        if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1
        }

        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    })

    // recursively sort children
    for (const n of nodes) {
        if (n.children.length > 0) {
            sortNodes(n.children)
        }
    }
}