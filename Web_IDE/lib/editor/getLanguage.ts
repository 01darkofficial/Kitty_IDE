export function getLanguage(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase()

    switch (ext) {
        case "js":
        case "mjs":
        case "cjs":
            return "javascript"

        case "ts":
            return "typescript"

        case "jsx":
            return "javascript"

        case "tsx":
            return "typescript"

        case "json":
            return "json"

        case "css":
            return "css"

        case "html":
            return "html"

        case "md":
            return "markdown"

        default:
            return "plaintext"
    }
}