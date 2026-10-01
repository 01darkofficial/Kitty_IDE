import type { Monaco } from "@monaco-editor/react"
import { LspDiagnostic } from "@/types/lsp"
import { convertSeverity } from "./diagnostics"

/**
 * Converts LSP diagnostics into Monaco editor markers.
 */
export function toMonacoMarkers(
    monaco: Monaco,
    diagnostics: LspDiagnostic[]
) {
    return diagnostics.map((diagnostic) => ({
        startLineNumber: diagnostic.range.start.line + 1,
        startColumn: diagnostic.range.start.character + 1,
        endLineNumber: diagnostic.range.end.line + 1,
        endColumn: diagnostic.range.end.character + 1,
        message: diagnostic.message,
        severity: convertSeverity(monaco, diagnostic.severity),
    }))
}