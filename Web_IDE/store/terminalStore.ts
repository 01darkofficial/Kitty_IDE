import { create } from "zustand"

export type PreviewInfo = {
    id: string
    port: number
    name: string
    url: string
}

export type TerminalInfo = {
    id: string
    name: string
    connected: boolean
    previews: PreviewInfo[]
}

type TerminalStore = {
    terminals: Record<string, TerminalInfo>
    activeTerminalId: string | null
    addTerminal: (terminal: TerminalInfo) => void
    removeTerminal: (terminalId: string) => void
    setActiveTerminal: (terminalId: string) => void
    setConnected: (terminalId: string, connected: boolean) => void
    addPreview: (terminalId: string, preview: PreviewInfo) => void
    removePreview: (terminalId: string, port: number) => void
}

export const useTerminalStore =
    create<TerminalStore>((set) => ({
        terminals: {},
        activeTerminalId: null,

        addTerminal: (terminal) => set((state) => ({
            terminals: {
                ...state.terminals,
                [terminal.id]: terminal
            }
        })),

        removeTerminal: (terminalId) => set((state) => {
            const next = { ...state.terminals }
            delete next[terminalId]

            return { terminals: next }
        }),

        setActiveTerminal: (terminalId) => set({ activeTerminalId: terminalId }),

        setConnected: (terminalId, connected) => set((state) => {

            const terminal = state.terminals[terminalId]

            if (!terminal) return state

            return {
                terminals: {
                    ...state.terminals,
                    [terminalId]: {
                        ...terminal,
                        connected
                    }
                }
            }
        }),

        addPreview: (terminalId, preview) => set((state) => {
            const terminal = state.terminals[terminalId]

            if (!terminal) return state

            return {
                terminals: {
                    ...state.terminals,
                    [terminalId]: {
                        ...terminal,
                        previews: [
                            ...terminal.previews,
                            preview
                        ]
                    }
                }
            }
        }),

        removePreview: (terminalId, port) => set((state) => {
            const terminal = state.terminals[terminalId]

            if (!terminal) return state

            return {
                terminals: {
                    ...state.terminals,
                    [terminalId]: {
                        ...terminal,
                        previews: terminal.previews.filter(
                            preview => preview.port !== port
                        )
                    }
                }
            }
        }),
    }))