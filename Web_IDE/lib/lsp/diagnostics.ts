import type { Monaco } from "@monaco-editor/react"
import { PublishDiagnosticsParams } from "@/types/lsp"

/**
 * Converts LSP diagnostics into Monaco editor markers.
 */
export function toMonacoMarkers(
    monaco: Monaco,
    diagnostics: PublishDiagnosticsParams["diagnostics"]
) {
    return diagnostics.map((diagnostic) => ({
        startLineNumber: diagnostic.range.start.line + 1,
        startColumn: diagnostic.range.start.character + 1,
        endLineNumber: diagnostic.range.end.line + 1,
        endColumn: diagnostic.range.end.character + 1,
        message: diagnostic.message,
        severity: convertSeverity(monaco, diagnostic.severity),
        source: diagnostic.source,
        code: diagnostic.code?.toString(),
    }))
}

/**
 * Maps LSP diagnostic severity values to Monaco marker severity.
 */
export function convertSeverity(
    monaco: Monaco,
    severity?: number
) {
    switch (severity) {
        case 1:
            return monaco.MarkerSeverity.Error
        case 2:
            return monaco.MarkerSeverity.Warning
        case 3:
            return monaco.MarkerSeverity.Info
        case 4:
            return monaco.MarkerSeverity.Hint
        default:
            return monaco.MarkerSeverity.Error
    }
}