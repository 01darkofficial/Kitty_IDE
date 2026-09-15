export async function updateServerPreviewCache(
    projectId: string,
    fileId: string,
    content: string
) {
    await fetch(`/api/projects/${projectId}/previewCache`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            fileId,
            content,
        }),
    })
}