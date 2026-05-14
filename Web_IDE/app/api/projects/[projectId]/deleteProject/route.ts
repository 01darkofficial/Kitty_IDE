import { createServerSupabase }
    from "@/lib/supabase/supabaseServer"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {

    const tStart = Date.now()

    /*
    Auth
    */

    const tAuth = Date.now()

    const { projectId } = await params

    const supabase =
        await createServerSupabase()

    const {
        data: { user }
    } = await supabase.auth.getUser()

    console.log(
        "Auth time:",
        Date.now() - tAuth
    )

    if (!user) {

        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        )

    }

    /*
    Verify project ownership
    */

    const {
        data: project,
        error: fetchError
    } = await supabase
        .from("projects")
        .select("id,user_id")
        .eq("id", projectId)
        .single()

    if (fetchError || !project) {

        return Response.json(
            { error: "Project not found" },
            { status: 404 }
        )

    }

    if (project.user_id !== user.id) {

        return Response.json(
            { error: "Forbidden" },
            { status: 403 }
        )

    }

    /*
    STEP 1 — Runtime deletion
    */

    try {

        const tRuntime = Date.now()

        const runtimeResponse =
            await fetch(
                `${process.env.RUNTIME_SERVER_URL}/project/delete`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        projectId
                    })
                }
            )

        console.log(
            "Runtime delete:",
            Date.now() - tRuntime
        )

        if (!runtimeResponse.ok) {

            console.error(
                "Runtime delete failed:",
                await runtimeResponse.text()
            )

            return Response.json(
                {
                    error:
                        "Runtime deletion failed"
                },
                { status: 500 }
            )

        }

    }
    catch (err) {

        console.error(
            "Runtime delete error:",
            err
        )

        return Response.json(
            {
                error:
                    "Runtime deletion failed"
            },
            { status: 500 }
        )

    }

    /*
    STEP 2 — Delete DB metadata
    */

    const tDelete = Date.now()

    const { error: deleteError } =
        await supabase
            .from("projects")
            .delete()
            .eq("id", projectId)
            .eq("user_id", user.id)

    console.log(
        "DB delete:",
        Date.now() - tDelete
    )

    if (deleteError) {

        console.error(
            "DB delete failed:",
            deleteError
        )

        return Response.json(
            {
                error:
                    "Database deletion failed"
            },
            { status: 500 }
        )

    }

    console.log(
        "Total delete time:",
        Date.now() - tStart
    )

    return Response.json({
        success: true
    })

}