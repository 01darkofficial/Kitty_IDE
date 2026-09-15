import { buildTree, TreeNode } from "@/lib/fileSystem/buildTree"

import { FileNode } from "@/types/db"

export async function fetchProjectTree(projectId: string): Promise<TreeNode[]> {
    const res = await fetch(`/api/projects/${projectId}/getFiles`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Failed to load files");
    }

    const data: { files: FileNode[] } = await res.json();

    const tree = buildTree(data.files);

    return tree;
}

export async function saveFile(
    projectId: string,
    fileId: string,
    content: string
) {

    const res = await fetch(`/api/projects/${projectId}/updateFile`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            fileId,
            content,
        }),
    })

    if (!res.ok) {
        throw new Error("Failed to save file")
    }

    return res.json()
}

export const createNode = async (
    projectId: string,
    node: FileNode
) => {

    const res = await fetch(`/api/projects/${projectId}/createNode`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(node)
    });

    if (!res.ok) {
        throw new Error("Failed to create node");
    }

    return res.json();
}

export const deleteNodes = async (
    projectId: string,
    fileIds: string[]
) => {

    const res = await fetch(`/api/projects/${projectId}/deleteNode`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fileIds
            })
        }
    )

    if (!res.ok) {
        throw new Error(
            "Failed to delete nodes"
        )
    }
    return res.json()

}