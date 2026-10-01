import AuthHydrator from "@/components/Auth/AuthHydrator"
import IDELayout from "@/components/IDE/IDELayout"
import { getProject, getProjectFiles } from "@/lib/api/projects/project"
import { getProfile, getUser } from "@/lib/api/user/user"
import { FileNode } from "@/types/db"
import { Project } from "@/types/db"
import { editorLogger } from "@/utils/logger"
import { User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export default async function EditorPage({
    params,
}: {
    params: Promise<{ projectId: string }>
}) {

    const user: User | null = await getUser()
    if (!user) redirect("/login")

    const profile = await getProfile(user.id);
    if (!profile) redirect("/login")


    const { projectId } = await params
    const project: Project = await getProject(projectId)
    const files: FileNode[] = await getProjectFiles(projectId)

    // Start runtime via proxy ONLY for Node projects
    if (project.runtime === "node") {
        const projectRuntimeEnv = project.runtime_env

        try {
            await fetch("http://localhost:4000/runtime/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    projectId,
                    projectRuntimeEnv,
                    files
                })
            })

        } catch (err) {
            editorLogger.kittyError("Failed to start runtime: ", err)

        }
    }

    return (
        <>
            <AuthHydrator user={user} profile={profile} />
            <IDELayout
                userId={user.id}
                project={project}
                files={files ?? []}
            />
        </>
    )
}