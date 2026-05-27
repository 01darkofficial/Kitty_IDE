import { createServerSupabase } from "@/lib/supabase/supabaseServer"
import { projectSchema } from "@/lib/validation/project"
import { seedRuntime } from "@/lib/runtime/seedRuntime"
import { resolveRuntimeEnv } from "@/lib/runtime/resolveRuntimeEnv"
import { projectLogger } from "@/utils/logger"
import z from "zod"

const RUNTIME_API_URL = process.env.RUNTIME_SERVER_URL

if (!RUNTIME_API_URL) {
    throw new Error("Missing RUNTIME_API_URL")
}

/**
Returns projects owned by the current user.
*/
export async function GET() {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        return Response.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        )
    }

    return Response.json({ projects: data })
}

/**
Creates a new project and provisions
its runtime workspace.
*/
export async function POST(
    req: Request
) {

    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const formData = await req.formData()
    const name = formData.get("name")?.toString()
    const runtime = formData.get("runtime")?.toString()

    const visibility = formData.get("visibility")?.toString()
    const source = formData.get("source")?.toString()

    const runtime_env = {
        node: formData.get("nodeVersion")?.toString() || "latest",
        pnpm: formData.get("pnpmVersion")?.toString() || "latest",
    }

    const files = formData.getAll("files") as File[]

    const parsed = projectSchema.safeParse({ name, runtime, runtime_env, visibility })

    if (!parsed.success) {
        return Response.json(
            { error: z.treeifyError(parsed.error) },
            { status: 400 }
        )
    }

    if (source === "import" && !files.length) {

        return Response.json(
            { error: "Import requires ZIP file" },
            { status: 400 }
        )
    }

    const { name: validatedName, runtime: validatedRuntime } = parsed.data

    let resolvedRuntimeEnv = null

    if (validatedRuntime === "node") {
        resolvedRuntimeEnv = await resolveRuntimeEnv(runtime_env)
    }

    const slug = validatedName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")

    const { data: project, error } = await supabase
        .from("projects")
        .insert({
            name: slug,
            runtime: validatedRuntime,
            runtime_env: resolvedRuntimeEnv,
            visibility,
            user_id: user.id
        })
        .select()
        .single()

    if (error) {
        if (error.code === "23505") {
            return Response.json(
                { error: "Project with this name already exists" },
                { status: 409 }
            )
        }

        return Response.json(
            { error: "Failed to create project" },
            { status: 500 }
        )
    }

    projectLogger.kittyLog("Project created: ", {
        projectId: project.id,
        source
    })

    try {
        if (source === "empty") {

            await seedRuntime(supabase, project.id, validatedRuntime)

            projectLogger.kittyLog("Runtime seeded: ", {
                projectId: project.id
            })
        }

        if (source === "import") {

            const zipFile = files[0]

            projectLogger.kittyLog("Preparing ZIP import: ",
                {
                    projectId: project.id,
                    size: zipFile.size
                }
            )

            /*
            Runtime workspace is materialized
            through the runtime service.
            */
            const runtimeFormData = new FormData()

            runtimeFormData.append("zip", zipFile, "project.zip")
            runtimeFormData.append("projectId", project.id)
            runtimeFormData.append("source", "import")

            const materializeRes = await fetch(`${RUNTIME_API_URL}/project/create`, {
                method: "POST",
                body: runtimeFormData
            })

            if (!materializeRes.ok) {
                const text = await materializeRes.text()

                projectLogger.kittyError("Workspace materialization failed: ", {
                    projectId: project.id,
                    status: materializeRes.status,
                    error: text
                })

                throw new Error(`Workspace materialization failed: ${text}`)
            }

            projectLogger.kittyLog("Workspace materialized: ", {
                projectId: project.id
            })
        }

    }
    catch (err) {

        projectLogger.kittyError("Project setup failed: ", {
            projectId: project.id,
            err
        })

        return Response.json(
            { error: "Project setup failed" },
            { status: 500 }
        )
    }

    return Response.json({ project })
}