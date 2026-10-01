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

/**
 * Returns the language identifier used by the TypeScript language server.
 */
export function getLspLanguage(filename: string): string | null {
    const ext = filename.split(".").pop()?.toLowerCase()

    switch (ext) {
        case "js":
        case "mjs":
        case "cjs":
            return "javascript"

        case "jsx":
            return "javascriptreact"

        case "ts":
            return "typescript"

        case "tsx":
            return "typescriptreact"

        default:
            return null
    }
}