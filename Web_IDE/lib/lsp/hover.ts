import type { Monaco } from "@monaco-editor/react"

type HoverContents =
    | string
    | { language?: string; value: string }
    | Array<string | { language?: string; value: string }>

export interface LspHover {
    contents: HoverContents
    range?: {
        start: { line: number; character: number }
        end: { line: number; character: number }
    }
}

/**
 * Converts an LSP hover response into Monaco's hover format.
 */
export function lspHoverToMonaco(
    monaco: Monaco,
    hover: LspHover | null
) {
    if (!hover) return null

    const contents = Array.isArray(hover.contents) ? hover.contents : [hover.contents]

    return {
        contents: contents.map((item) => {
            if (typeof item === "string") {
                return { value: item }
            }

            return {
                value: item.language ? `\`\`\`${item.language}\n${item.value}\n\`\`\`` : item.value,
            }
        }),

        range: hover.range ? new monaco.Range(
            hover.range.start.line + 1,
            hover.range.start.character + 1,
            hover.range.end.line + 1,
            hover.range.end.character + 1,
        ) : undefined,
    }
}