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

export const saveFile = async (activeFile: FileNode) => {
    await fetch(`/api/projects/${activeFile.project_id}/updateFile`, {
        method: "POST",
        body: JSON.stringify({
            id: activeFile.id,
            content: activeFile.content
        })
    });;
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