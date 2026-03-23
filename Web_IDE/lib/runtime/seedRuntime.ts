import { SupabaseClient } from "@supabase/supabase-js"
import { runtimeDefaults, Runtime } from "./runtimeDefaults"

type FolderRow = {
    id: string
}

export async function seedRuntime(
    supabase: SupabaseClient,
    projectId: string,
    runtime: Runtime
) {
    const runtimeConfig = runtimeDefaults[runtime]

    if (!runtimeConfig) return

    // cache folder paths → folder ids
    const folderCache = new Map<string, string>()

    for (const file of runtimeConfig.files) {
        const parts = file.path.split("/")

        let parentId: string | null = null
        let currentPath = ""

        for (let i = 0; i < parts.length; i++) {
            const name = parts[i]
            const isFile = i === parts.length - 1

            currentPath = currentPath
                ? `${currentPath}/${name}`
                : name

            // folder already exists
            if (!isFile && folderCache.has(currentPath)) {
                parentId = folderCache.get(currentPath)!
                continue
            }

            if (isFile) {
                const result = await supabase
                    .from("files")
                    .insert({
                        project_id: projectId,
                        parent_id: parentId,
                        name,
                        type: "file",
                        content: file.content
                    })

                if (result.error) {
                    throw new Error(
                        "Runtime file creation failed: " +
                        result.error.message
                    )
                }

            } else {
                const result = await supabase
                    .from("files")
                    .insert({
                        project_id: projectId,
                        parent_id: parentId,
                        name,
                        type: "folder",
                        content: null
                    })
                    .select("id")
                    .single()

                const data = result.data as FolderRow | null
                const error = result.error

                if (error || !data) {
                    throw new Error(
                        "Failed to create runtime folder: " +
                        error?.message
                    )
                }

                const folderId = data.id

                folderCache.set(currentPath, folderId)

                parentId = folderId
            }
        }
    }
}