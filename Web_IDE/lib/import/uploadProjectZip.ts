import { importLogger } from "@/utils/logger"

type UploadProjectZipProps = {
    file: Blob
    filename: string
    projectType: string
    nodeVersion: string
    pnpmVersion: string
}

/**
Uploads a ZIP archive and creates
a new imported project workspace.
*/
export async function uploadProjectZip({
    file,
    filename,
    nodeVersion,
    pnpmVersion,
}: UploadProjectZipProps) {

    const formData = new FormData()

    formData.append("name", filename.replace(".zip", ""))
    formData.append("runtime", "node")
    formData.append("visibility", "private")
    formData.append("source", "import")
    formData.append("nodeVersion", nodeVersion)
    formData.append("pnpmVersion", pnpmVersion)
    formData.append("files", file, filename)

    const response = await fetch("/api/projects/import", {
        method: "POST",
        body: formData,
    })

    if (!response.ok) {

        const error = await response.json()

        importLogger.kittyError("Project upload failed: ", error)
        throw new Error(JSON.stringify(error, null, 2))
    }

    return response.json()
}