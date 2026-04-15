import { supabaseAdmin }
    from "@/lib/supabase/admin"
import { FileNode } from "@/types/db"

export async function POST(
    req: Request
) {

    try {

        const body =
            await req.json()

        const {
            projectId,
            entries
        } = body

        const createdNodes: FileNode[] = []


        console.log("frontend recieved entries: ", entries)

        if (!projectId) {

            return Response.json(
                { error: "Missing projectId" },
                { status: 400 }
            )

        }

        if (!Array.isArray(entries)) {

            console.error(
                "Invalid entries payload:",
                entries
            )

            return Response.json(
                { error: "Invalid entries" },
                { status: 400 }
            )

        }

        const supabase =
            supabaseAdmin


        entries.sort((a, b) => {

            const depthA =
                a.relative.split("/").length

            const depthB =
                b.relative.split("/").length

            return depthA - depthB

        })

        /*
        Process entries
        */

        for (const entry of entries) {

            const relative =
                entry.relative

            const type =
                entry.type

            if (!relative || !type)
                continue

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
                Handle null parent correctly
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

                const {
                    data: existing,
                    error: findError
                } =
                    await query
                        .maybeSingle()

                if (findError) {

                    console.error(
                        "Parent lookup failed:",
                        folder,
                        findError
                    )

                    continue

                }

                /*
                Parent exists
                */

                if (existing) {

                    parentId =
                        existing.id

                    continue

                }

                /*
                Create missing parent
                */

                const {
                    data: created,
                    error: createError
                } =
                    await supabase
                        .from("files")
                        .upsert(
                            {
                                name: folder,
                                type: "folder",
                                project_id: projectId,
                                parent_id: parentId
                            },
                            {
                                onConflict:
                                    "project_id,parent_id,name"
                            }
                        )
                        .select("id")
                        .single()

                if (
                    createError ||
                    !created
                ) {

                    console.error(
                        "Parent creation failed:",
                        folder,
                        createError
                    )

                    continue

                }

                parentId =
                    created.id

            }
            /*
            Create final node
            */

            const {
                data: created,
                error: finalError
            } =
                await supabase
                    .from("files")
                    .upsert(
                        {
                            name,
                            type,
                            project_id: projectId,
                            parent_id: parentId
                        },
                        {
                            onConflict:
                                "project_id,parent_id,name"
                        }
                    )
                    .select("*")   // ← IMPORTANT
                    .single()

            createdNodes.push(created)

            if (finalError) {

                console.error(
                    "Final insert failed:",
                    name,
                    finalError
                )

            }

        }

        return Response.json({
            success: true,
            nodes: createdNodes
        })

    }

    catch (err) {

        console.error(
            "Internal create failed:",
            err
        )

        return Response.json(
            { error: "Internal error" },
            { status: 500 }
        )

    }

}