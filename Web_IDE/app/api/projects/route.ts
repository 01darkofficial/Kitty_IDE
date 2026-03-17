import { createServerSupabase } from "@/lib/supabase/supabaseServer"
import { projectSchema } from "@/lib/validation/project"
import { seedTemplate } from "@/lib/templates/seedTemplate"
import { TemplateId, templates } from "@/lib/templates/templates"

export async function GET() {
    const supabase = await createServerSupabase()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
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
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const parsed = projectSchema.safeParse(body)

    if (!parsed.success) {
        return Response.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { name, template, language, visibility } = parsed.data;

    const templateId = template as TemplateId

    // ensure template exists
    if (!templates[template]) {
        return Response.json(
            { error: "Invalid template" },
            { status: 400 }
        )
    }

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
            template,
            language,
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

    // seed template files
    try {
        await seedTemplate(supabase, project.id, template)
    } catch (e) {
        console.error("Template seeding failed:", e)
    }

    return Response.json({ project })
}