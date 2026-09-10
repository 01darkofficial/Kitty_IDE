import { create } from "zustand"

export type MobileWorkspace = "editor" | "explorer" | "terminal" | "preview"

interface WorkspaceStore {

    explorerOpen: boolean
    terminalOpen: boolean
    previewOpen: boolean

    explorerWidth: number
    previewWidth: number
    terminalHeight: number

    explorerMinWidth: number
    explorerMaxWidth: number

    previewMinWidth: number
    previewMaxWidth: number

    terminalMinHeight: number
    terminalMaxHeight: number


    isResizing: boolean
    isZenMode: boolean
    isFullscreen: boolean

    mobileWorkspace: MobileWorkspace
    setMobileWorkspace: (workspace: MobileWorkspace) => void

    setExplorerOpen: (open: boolean) => void
    setTerminalOpen: (open: boolean) => void
    setPreviewOpen: (open: boolean) => void

    toggleExplorer: () => void
    toggleTerminal: () => void
    togglePreview: () => void

    setExplorerWidth: (width: number) => void
    setPreviewWidth: (width: number) => void
    setTerminalHeight: (height: number) => void

    setIsResizing: (value: boolean) => void
    toggleZenMode: () => void
    toggleFullscreen: () => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({

    explorerOpen: true,
    terminalOpen: true,
    previewOpen: true,

    explorerWidth: 260,
    previewWidth: 420,
    terminalHeight: 300,

    explorerMinWidth: 180,
    explorerMaxWidth: 420,

    previewMinWidth: 320,
    previewMaxWidth: 700,

    terminalMinHeight: 180,
    terminalMaxHeight: 520,

    isResizing: false,
    isZenMode: false,
    isFullscreen: false,

    mobileWorkspace: "editor",
    setMobileWorkspace: (workspace) => set({ mobileWorkspace: workspace }),

    setExplorerOpen: (open) => set({ explorerOpen: open }),
    setTerminalOpen: (open) => set({ terminalOpen: open }),
    setPreviewOpen: (open) => set({ previewOpen: open }),

    toggleExplorer: () => set((state) => ({ explorerOpen: !state.explorerOpen, })),
    toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen, })),
    togglePreview: () => set((state) => ({ previewOpen: !state.previewOpen, })),


    setExplorerWidth: (width) => set({ explorerWidth: width }),
    setPreviewWidth: (width) => set({ previewWidth: width }),
    setTerminalHeight: (height) => set({ terminalHeight: height }),

    setIsResizing: (value) => set({ isResizing: value }),

    toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
    toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
}))