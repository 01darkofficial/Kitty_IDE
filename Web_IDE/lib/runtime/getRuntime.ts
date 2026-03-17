import fs from "fs"
import path from "path"

const templateRuntimeMap: Record<string, string> = {
    "vite-react": "container",
    "vite-react-ts": "container",
    "node-express": "container",
    "static-html": "static",
    "blank": "detect",
    "custom": "detect",
    "browser_vanilla": "static",
    "browser_canvas": "detect",
    "node_basic": "container",
    "node_express": "container",
    "vite_vanilla": "container"
}

export function resolveRuntime(projectId: string, template: string) {

    const runtime = templateRuntimeMap[template]

    if (runtime !== "detect") {
        return runtime
    }

    // fallback detection

    const projectPath = path.join(
        process.cwd(),
        "cloud-ide-runtime",
        "projects",
        projectId
    )

    if (fs.existsSync(path.join(projectPath, "package.json"))) {
        return "container"
    }

    return "static"
}