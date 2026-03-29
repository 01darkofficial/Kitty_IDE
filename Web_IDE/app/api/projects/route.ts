import { createServerSupabase } from "@/lib/supabase/supabaseServer"
import { projectSchema } from "@/lib/validation/project"
import { seedRuntime } from "@/lib/runtime/seedRuntime"
import { resolveRuntimeEnv } from "@/lib/runtime/resolveRuntimeEnv"
import z from "zod"

export async function GET() {
    const supabase = await createServerSupabase()

    const {
        data: { user },
    } = await supabase.auth.getUser()

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

export async function POST(req: Request) {
    const supabase = await createServerSupabase()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const body = await req.json()

    const parsed = projectSchema.safeParse(body)

    if (!parsed.success) {
        return Response.json(
            { error: z.treeifyError(parsed.error) },
            { status: 400 }
        )
    }

    const { name, runtime, runtime_env, visibility } = parsed.data

    let resolvedRuntimeEnv = null

    if (runtime === "node") {

        resolvedRuntimeEnv =
            await resolveRuntimeEnv(
                runtime_env || {
                    node: "latest"
                }
            )

    }

    console.log(resolvedRuntimeEnv);

    // slug normalization
    const slug = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")

    const { data: project, error } = await supabase
        .from("projects")
        .insert({
            name: slug,
            runtime,
            runtime_env: resolvedRuntimeEnv,
            visibility,
            user_id: user.id,
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

    // seed runtime files (only static creates files)
    try {
        await seedRuntime(
            supabase,
            project.id,
            runtime
        )
    } catch (e) {
        console.error("Runtime seeding failed:", e)
    }

    return Response.json({ project })
}