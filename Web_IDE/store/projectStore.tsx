import { create } from "zustand"

import { Project } from "@/types/db"
import { projectStoreLogger } from "@/utils/logger"
import { createProjectApi, deleteProjectApi, updateProjectApi } from "@/lib/apiClient/projects/project"

type CreateProjectPayload =
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

interface ProjectStore {
    projects: Record<string, Project>
    projectIds: string[]
    activeProjectId: string | null
    loading: boolean
    initialized: boolean
    hydrateProjects: (projects: Project[]) => void
    getProjects: () => Project[]
    getProjectById: (projectId: string) => Project | null
    addProject: (project: Project) => void
    fetchProjects: () => Promise<void>
    createProject: (payload: CreateProjectPayload) => Promise<Project | null>
    deleteProject: (projectId: string) => Promise<void>
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>
    setActiveProject: (projectId: string | null) => void
    clearProjects: () => void
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
    projects: {},
    projectIds: [],
    activeProjectId: null,
    loading: false,
    initialized: false,

    hydrateProjects: (projectsArray) => {
        const normalized: Record<string, Project> = {}
        const ids: string[] = []

        for (const project of projectsArray) {
            normalized[project.id] = project
            ids.push(project.id)
        }

        set({
            projects: normalized,
            projectIds: ids,
            initialized: true
        })
    },

    getProjects: () => {
        const { projects, projectIds } = get()
        return projectIds.map(id => projects[id]).filter(Boolean)
    },

    getProjectById: (projectId) => {
        return (get().projects[projectId] ?? null)
    },

    addProject: (project) => {
        set(state => ({
            projects: {
                ...state.projects,
                [project.id]: project
            },
            projectIds: [
                project.id,
                ...state.projectIds
            ]
        }))
    },

    fetchProjects: async () => {

        if (get().loading) {
            return
        }

        try {

            set({ loading: true })

            const res = await fetch("/api/projects")

            if (!res.ok) {
                throw new Error("Failed to fetch projects")
            }

            const data = await res.json()
            const normalized: Record<string, Project> = {}
            const ids: string[] = []

            for (const project of data.projects ?? []) {
                normalized[project.id] = project
                ids.push(project.id)
            }

            set({
                projects: normalized,
                projectIds: ids,
                initialized: true
            })
        }
        catch (err) {
            console.error("fetchProjects:", err)
        }

        finally {
            set({ loading: false })
        }

    },

    createProject: async (payload) => {
        try {
            const project = await createProjectApi(payload)

            set(state => ({
                projects: {
                    ...state.projects,
                    [project.id]: project
                },
                projectIds: [
                    project.id,
                    ...state.projectIds
                ]
            }))

            return project
        }

        catch (err) {
            projectStoreLogger.kittyError("createProject: ", err)
            throw err
        }
    },

    deleteProject: async (projectId) => {
        const previousProjects = get().projects
        const previousProjectIds = get().projectIds

        set(state => {
            const updated = { ...state.projects }

            delete updated[projectId]

            return {
                projects: updated,
                projectIds: state.projectIds.filter(id => id !== projectId)
            }

        })

        try {
            await deleteProjectApi(projectId)
        }

        catch (err) {
            projectStoreLogger.kittyError("deleteProject: ", err)
            set({
                projects: previousProjects,
                projectIds: previousProjectIds
            })
        }
    },

    updateProject: async (projectId, updates) => {
        const existing = get().projects[projectId]

        if (!existing) {
            return
        }

        set(state => ({
            projects: {
                ...state.projects,
                [projectId]: {
                    ...existing,
                    ...updates
                }
            }
        }))

        try {
            const res = await await updateProjectApi(projectId, updates)
            if (!res.ok) {
                throw new Error("Failed to update project")
            }
        }
        catch (err) {
            projectStoreLogger.kittyError("updateProject: ", err)
        }
    },

    setActiveProject: (projectId) => {
        set({ activeProjectId: projectId })
    },

    clearProjects: () => {
        set({
            projects: {},
            projectIds: [],
            activeProjectId: null,
            initialized: false
        })
    }
}))