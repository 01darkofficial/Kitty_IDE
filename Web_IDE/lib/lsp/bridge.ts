import type { Monaco } from "@monaco-editor/react"
import { onDiagnostics, sendRequest } from "./client"
import { toMonacoMarkers } from "./diagnostics"
import { LspHover, lspHoverToMonaco } from "./hover"

const models = new Map<string, any>()
let initialized = false

/**
 * Registers LSP integrations with Monaco.
 *
 * Sets up diagnostic handling and the TypeScript hover provider.
 */
export function initializeBridge(monaco: Monaco) {
    if (initialized) return
    initialized = true

    /* ---------------- Diagnostics ---------------- */

    onDiagnostics((params) => {
        const model = models.get(params.uri)
        if (!model) return
        monaco.editor.setModelMarkers(model, "kitty-lsp", toMonacoMarkers(monaco, params.diagnostics))
    })

    /* ---------------- Hover Provider ---------------- */

    const provider = {
        provideHover: async (model: any, position: any) => {
            const hover = await sendRequest<LspHover>("textDocument/hover", {
                textDocument: {
                    uri: model.uri.toString(),
                },
                position: {
                    line: position.lineNumber - 1,
                    character: position.column - 1,
                },
            })

            if (!hover) {
                return null
            }

            return lspHoverToMonaco(monaco, hover)
        },
    }

    monaco.languages.registerHoverProvider("typescript", provider)
}

/**
 * Associates a Monaco model from the LSP model registry.
 */
export function attachModel(model: any, monaco: Monaco) {
    initializeBridge(monaco)
    models.set(model.uri.toString(), model)
}

/**
 * Removes a Monaco model from the LSP model registry.
 */
export function detachModel(model: any) {
    models.delete(model.uri.toString())
}
