import { Icon } from "@iconify/react"
import { File } from "lucide-react"

export function getFileIcon(filename: string) {

    const name = filename.toLowerCase()
    const ext = name.split(".").pop()

    // special filenames
    if (name === "package.json")
        return <Icon icon="vscode-icons:file-type-node" width="16" />

    if (name === "tsconfig.json")
        return <Icon icon="vscode-icons:file-type-typescript" width="16" />

    if (name === "next.config.js")
        return <Icon icon="logos:nextjs-icon" width="16" />

    if (name === "tailwind.config.js")
        return <Icon icon="logos:tailwindcss-icon" width="16" />

    if (name === ".env")
        return <Icon icon="vscode-icons:file-type-node" width="16" />

    if (name === ".gitignore")
        return <Icon icon="logos:git-icon" width="16" />

    switch (ext) {

        case "js":
        case "mjs":
        case "cjs":
            return <Icon icon="logos:javascript" width="16" />

        case "ts":
            return <Icon icon="logos:typescript-icon" width="16" />

        case "jsx":
        case "tsx":
            return <Icon icon="logos:react" width="16" />

        case "html":
            return <Icon icon="logos:html-5" width="16" />

        case "css":
            return <Icon icon="logos:css-3" width="16" />

        case "scss":
        case "sass":
            return <Icon icon="logos:sass" width="16" />

        case "json":
            return <Icon icon="vscode-icons:file-type-json" width="16" />

        case "md":
            return <Icon icon="vscode-icons:file-type-markdown" width="16" />

        case "yml":
        case "yaml":
            return <Icon icon="vscode-icons:file-type-yaml" width="16" />

        case "svg":
            return <Icon icon="vscode-icons:file-type-svg" width="16" />

        case "png":
        case "jpg":
        case "jpeg":
        case "webp":
            return <Icon icon="vscode-icons:file-type-image" width="16" />

        case "txt":
            return <Icon icon="vscode-icons:file-type-text" width="16" />

        default:
            return <File size={16} className="text-zinc-400" />
    }
}