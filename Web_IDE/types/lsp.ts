export interface LspDiagnostic {
    range: {
        start: {
            line: number
            character: number
        }
        end: {
            line: number
            character: number
        }
    }
    severity?: number
    code?: string | number
    message: string
    source?: string
    relatedInformation?: LspDiagnosticRelatedInformation[]
}

export interface LspDiagnosticRelatedInformation {
    location: {
        uri: string
        range: LspDiagnostic["range"]
    }
    message: string
}

export interface PublishDiagnosticsParams {
    uri: string
    diagnostics: LspDiagnostic[]
}
