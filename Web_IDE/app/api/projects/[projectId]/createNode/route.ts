import { createServerSupabase } from "@/lib/supabase/supabaseServer"
import { createNodeSchema } from "@/lib/validation/file"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {

    const tStart = Date.now()

    const tAuth = Date.now()
    const { projectId } = await params
    const supabase = await createServerSupabase()
    const { data: { user }, } = await supabase.auth.getUser()

    console.log("Auth time:", Date.now() - tAuth)

    if (!user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    /*
    Parse request body
    */

    const body = await req.json()

    const parsed = createNodeSchema.safeParse(body)

    if (!parsed.success) {
        return Response.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { name, type, parent_id } = parsed.data

    /*
    Insert metadata into DB
    */

    const tInsert = Date.now()
    const { data, error } = await supabase.from("files").insert(
        {
            name,
            type,
            project_id: projectId,
            parent_id: parent_id ?? null,
        }
    ).select().single()

    console.log("Insert time:", Date.now() - tInsert)
    console.log("Total API time:", Date.now() - tStart)

    if (error) {
        return Response.json(
            { error: error.message },
            { status: 500 }
        )
    }

    const parentChain = await fetchParentChain(supabase, data.parent_id)

    const minimalFiles = [data, ...parentChain]

    /*
    Call proxy to create file
    */

    try {
        const t1 = Date.now()
        const proxyResponse = await fetch(`${process.env.PROXY_URL}/files/create`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    projectId,
                    file: data,
                    allFiles: minimalFiles
                })
            }
        )
        console.log("Proxy create:", Date.now() - t1)

        if (!proxyResponse.ok) {
            console.error(
                "Proxy file creation failed:",
                await proxyResponse.text()
            )

            /*
            Rollback DB insert
            */

            await supabase.from("files").delete().eq("id", data.id)

            return Response.json(
                { error: "Disk creation failed — DB rolled back" },
                { status: 500 }
            )
        }

    } catch (err) {
        console.error("Proxy file creation failed:", err)
        return Response.json(
            { error: "File metadata created but disk creation failed" },
            { status: 500 }
        )
    }

    /*
    Return created metadata
    */

    return Response.json(data)
}

async function fetchParentChain(
    supabase: any,
    parentId: string | null
) {

    const parents: any[] = []

    let current = parentId

    while (current) {

        const { data } = await supabase.from("files").select("id,name,parent_id").eq("id", current).single()

        if (!data) break

        parents.push(data)
        current = data.parent_id

    }

    return parents

}