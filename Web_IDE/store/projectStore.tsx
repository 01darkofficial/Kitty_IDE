// import { create } from "zustand"
// import { supabase } from "@/lib/supabase/supabaseClient"

// interface Project {
//     id: string
//     name: string
//     description: string
//     created_at: string
// }

// interface FileNode {
//     id: string
//     name: string
//     type: "file" | "folder"
//     parent_id: string | null
// }

// interface ProjectState {
//     project: Project | null
//     files: FileNode[]
//     loading: boolean

//     fetchProject: (projectId: string) => Promise<void>
//     fetchFiles: (projectId: string) => Promise<void>
// }

// export const useProjectStore = create<ProjectState>((set) => ({
//     project: null,
//     files: [],
//     loading: false,

//     fetchProject: async (projectId) => {
//         // const supabase = createClient()

//         set({ loading: true })

//         const { data } = await supabase
//             .from("projects")
//             .select("*")
//             .eq("id", projectId)
//             .single()

//         set({
//             project: data,
//             loading: false
//         })
//     },

//     fetchFiles: async (projectId) => {
//         // const supabase = createClient()

//         const { data } = await supabase
//             .from("files")
//             .select("*")
//             .eq("project_id", projectId)

//         set({
//             files: data ?? []
//         })
//     }
// }))