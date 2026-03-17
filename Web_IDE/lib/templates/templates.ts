export type TemplateFile = {
    path: string
    content: string
}

export type Template = {
    label: string
    files: TemplateFile[]
}

export type TemplateId =
    | "empty"
    | "browser_vanilla"
    | "browser_canvas"
    | "node_basic"
    | "node_express"
    | "vite_vanilla"

export const templates: Record<TemplateId, Template> = {
    empty: {
        label: "Empty Project",
        files: []
    },

    browser_vanilla: {
        label: "Browser (Vanilla JS)",
        files: [
            {
                path: "index.html",
                content: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>App</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<h1>Hello World</h1>

<script src="script.js"></script>
</body>
</html>`
            },
            {
                path: "script.js",
                content: `console.log("Hello from your project")`
            },
            {
                path: "style.css",
                content: `body {
  font-family: sans-serif;
}`
            },
            {
                path: "README.md",
                content: `# Browser Project

This project runs directly in the browser.
Open index.html to start.
`
            }
        ]
    },

    browser_canvas: {
        label: "Canvas Starter",
        files: [
            {
                path: "index.html",
                content: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Canvas App</title>
<style>
body {
  margin: 0;
}
</style>
</head>
<body>

<canvas id="canvas"></canvas>

<script src="script.js"></script>
</body>
</html>`
            },
            {
                path: "script.js",
                content: `const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.fillStyle = "red"
ctx.fillRect(100, 100, 100, 100)`
            },
            {
                path: "README.md",
                content: `# Canvas Project

This template initializes a fullscreen canvas.
`
            }
        ]
    },

    node_basic: {
        label: "Node Script",
        files: [
            {
                path: "index.js",
                content: `console.log("Node project started")`
            },
            {
                path: "package.json",
                content: `{
  "name": "node-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  }
}`
            },
            {
                path: "README.md",
                content: `# Node Project

Run the project with:

npm start
`
            }
        ]
    },

    node_express: {
        label: "Express API",
        files: [
            {
                path: "server.js",
                content: `import express from "express"

const app = express()

app.get("/", (req, res) => {
  res.send("API running")
})

const PORT = 3000

app.listen(PORT, () => {
  console.log("Server started on port " + PORT)
})`
            },
            {
                path: "package.json",
                content: `{
  "name": "express-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`
            },
            {
                path: "README.md",
                content: `# Express API

Install dependencies:

npm install

Start the server:

npm start
`
            }
        ]
    },
    vite_vanilla: {
        label: "Vite App",
        files: [
            {
                path: "index.html",
                content: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Vite App</title>
</head>
<body>

<div id="app"></div>

<script type="module" src="./main.js"></script>

</body>
</html>`
            },
            {
                path: "main.js",
                content: `import { greet } from "./utils.js"

const el = document.getElementById("app")

el.innerHTML = \`
  <h1>Vite Project</h1>
  <button id="btn">Click me</button>
\`

document.getElementById("btn").onclick = () => {
  alert(greet("Developer"))
}`
            },
            {
                path: "utils.js",
                content: `export function greet(name){
  return "Hello " + name + " 🚀"
}`
            },
            {
                path: "package.json",
                content: `{
  "name": "vite-project",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}`
            }
        ]
    }
}