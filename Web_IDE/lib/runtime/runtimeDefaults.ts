export type Runtime = "static" | "node"

export const runtimeDefaults: Record<
    Runtime,
    { files: { path: string; content: string }[] }
> = {
    static: {
        files: [
            {
                path: "index.html",
                content: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Static Project</title>
<link rel="stylesheet" href="style.css" />
</head>

<body>
<h1>Hello World</h1>
<script src="script.js"></script>
</body>
</html>`
            },
            {
                path: "style.css",
                content: `body { font-family: sans-serif; }`
            },
            {
                path: "script.js",
                content: `console.log("Static project ready");`
            }
        ]
    },

    node: {
        files: [] // blank project
    }
}