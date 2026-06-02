import { createServerSupabase } from "@/lib/supabase/supabaseServer"
import { projectSchema } from "@/lib/validation/project"
// import { seedRuntime } from "@/lib/runtime/seedRuntime"
import { resolveRuntimeEnv } from "@/lib/runtime/resolveRuntimeEnv"
import { projectLogger } from "@/utils/logger"
import z from "zod"

const RUNTIME_API_URL = process.env.RUNTIME_SERVER_URL

if (!RUNTIME_API_URL) {
    throw new Error("Missing RUNTIME_API_URL")
}

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
        .order(
            "created_at",
            { ascending: false }
        )

    if (error) {
        return Response.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        )
    }

    return Response.json({ projects: data })
}

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

    const body = await req.json()
    const parsed = projectSchema.safeParse(body)

    console.log(parsed)


    if (!parsed.success) {
        return Response.json(
            { error: z.treeifyError(parsed.error) },
            { status: 400 }
        )
    }

    const {
        name: validatedName,
        runtime: validatedRuntime,
        visibility: validatedVisibility
    } = parsed.data
    let resolvedRuntimeEnv = null

    if (validatedRuntime === "node") {
        resolvedRuntimeEnv = await resolveRuntimeEnv(parsed.data.runtime_env)
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
            visibility: validatedVisibility,
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

    projectLogger.kittyLog("Project created: ", { projectId: project.id })

    try {
        // await seedRuntime(supabase, project.id, validatedRuntime)
        projectLogger.kittyLog("Workspace provisioning started: ", { projectId: project.id })

        const runtimeRes = await fetch(`${RUNTIME_API_URL}/project/createWorkspace`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                projectId: project.id
            })
        })

        if (!runtimeRes.ok) {
            const text = await runtimeRes.text()
            throw new Error(`Workspace creation failed: ${text}`)
        }
    }
    catch (err) {
        projectLogger.kittyError("Workspace provisioning failed: ",
            {
                projectId: project.id,
                err
            }
        )

        return Response.json(
            { error: "Project setup failed" },
            { status: 500 }
        )
    }

    return Response.json({ project })

}