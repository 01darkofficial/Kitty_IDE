import { SupabaseClient } from "@supabase/supabase-js"
import { templates, TemplateId } from "./templates"

type FolderRow = {
    id: string
}

export async function seedTemplate(
    supabase: SupabaseClient,
    projectId: string,
    templateId: TemplateId
) {
    const template = templates[templateId]

    if (!template) return

    // cache folder paths → folder ids
    const folderCache = new Map<string, string>()

    for (const file of template.files) {
        const parts = file.path.split("/")

        let parentId: string | null = null
        let currentPath = ""

        for (let i = 0; i < parts.length; i++) {
            const name = parts[i]
            const isFile = i === parts.length - 1

            currentPath = currentPath ? `${currentPath}/${name}` : name

            // check if folder already created
            if (!isFile && folderCache.has(currentPath)) {
                parentId = folderCache.get(currentPath)!
                continue
            }

            if (isFile) {
                const result = await supabase.from("files").insert({
                    project_id: projectId,
                    parent_id: parentId,
                    name,
                    type: "file",
                    content: file.content
                })

                if (result.error) {
                    throw new Error("Template file creation failed: " + result.error.message)
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
                    .single();

                const data = result.data as FolderRow | null
                const error = result.error

                if (error || !data) {
                    throw new Error("Failed to create template folder: " + error?.message)
                }

                const folderId = data.id

                folderCache.set(currentPath, folderId)

                parentId = folderId
            }
        }
    }
}