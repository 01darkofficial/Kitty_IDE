import { Project } from "@/types/db"

export type CreateProjectPayload =
    | {
        name: string
        runtime: "static"
        visibility: "private" | "public"
    }
    | {
        name: string
        runtime: "node"
        runtime_env: {
            node: string
            pnpm: string
        }
        visibility: "private" | "public"
    }

export async function getProjectsApi() {

    const res = await fetch("/api/projects")

    if (!res.ok) {
        throw new Error("Failed to fetch projects")
    }

    return res.json()
}

export async function createProjectApi(
    payload: CreateProjectPayload
) {

    const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    if (!res.ok) {
        throw new Error("Failed to create project")
    }

    const data = await res.json()

    return data.project as Project
}

export async function updateProjectApi(
    projectId: string,
    updates: Partial<Project>
) {

    const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    })

    if (!res.ok) {
        throw new Error("Failed to update project")
    }

    return res.json()
}

export async function deleteProjectApi(
    projectId: string
) {

    const res = await fetch(`/api/projects/${projectId}/deleteProject`, {
        method: "DELETE"
    })

    if (!res.ok) {
        throw new Error("Failed to delete project")
    }

    return true
}