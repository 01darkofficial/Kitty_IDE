import JSZip from "jszip"
import { shouldIgnorePath } from "./shouldIgnorePath"

/**
Creates a cleaned ZIP archive by removing
ignored files and directories.
*/
export async function cleanZip(
    file: File
) {

    const zip = await JSZip.loadAsync(file)
    const cleanedZip = new JSZip()
    const entries = Object.entries(zip.files)

    for (const [path, entry] of entries) {
        if (shouldIgnorePath(path)) {
            continue
        }

        if (entry.dir) {
            cleanedZip.folder(path)
            continue
        }

        const content = await entry.async("uint8array")
        cleanedZip.file(path, content)
    }

    return cleanedZip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 9, },
    })
}