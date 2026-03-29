export type RuntimeInfo = {
    host: string
    port: number
}

export const runtimeMap = new Map<string, RuntimeInfo>()

export const previewReadyMap = new Map<string, boolean>()

export const previewPrintedMap = new Map<string, boolean>()