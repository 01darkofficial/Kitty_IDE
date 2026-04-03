import { supabaseAdmin }
    from "@/lib/supabase/admin"

export async function POST(
    req: Request
) {

    try {

        const {
            projectId,
            paths
        } = await req.json()

        if (!projectId) {

            return Response.json(
                { error: "Missing projectId" },
                { status: 400 }
            )

        }

        if (!Array.isArray(paths)) {

            return Response.json({
                success: true
            })

        }

        const supabase =
            supabaseAdmin

        for (const relative of paths) {

            const parts =
                relative.split("/")

            const name =
                parts.pop()

            if (!name)
                continue

            let parentId:
                string | null = null

            /*
            Resolve parent chain
            */

            for (const folder of parts) {

                let query =
                    supabase
                        .from("files")
                        .select("id")
                        .eq("project_id", projectId)
                        .eq("name", folder)

                /*
                CRITICAL FIX:
                handle null parent properly
                */

                if (parentId === null) {

                    query =
                        query.is(
                            "parent_id",
                            null
                        )

                } else {

                    query =
                        query.eq(
                            "parent_id",
                            parentId
                        )

                }

                /*
                Use limit instead of maybeSingle
                */

                const {
                    data: rows,
                    error
                } =
                    await query.limit(1)

                if (error) {

                    console.error(
                        "Parent lookup failed:",
                        folder,
                        error
                    )

                    parentId = null
                    break

                }

                const existing =
                    rows?.[0] ?? null

                if (!existing) {

                    parentId = null
                    break

                }

                parentId =
                    existing.id

            }

            /*
            Delete target
            */

            let deleteQuery =
                supabase
                    .from("files")
                    .delete()
                    .eq(
                        "project_id",
                        projectId
                    )
                    .eq(
                        "name",
                        name
                    )

            if (parentId === null) {

                deleteQuery =
                    deleteQuery.is(
                        "parent_id",
                        null
                    )

            } else {

                deleteQuery =
                    deleteQuery.eq(
                        "parent_id",
                        parentId
                    )

            }

            const { error } =
                await deleteQuery

            if (error) {

                console.error(
                    "Delete failed:",
                    relative,
                    error
                )

            }

        }

        return Response.json({
            success: true
        })

    }

    catch (err) {

        console.error(
            "Internal delete failed:",
            err
        )

        return Response.json(
            { error: "Internal error" },
            { status: 500 }
        )

    }

}