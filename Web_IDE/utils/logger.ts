import { createKittyLogger } from "./kittyLogger"

/**
 * Frontend logger registry.
 *
 * Uses namespace:
 * kitty-ide-*
 */

export const frontendLogger = createKittyLogger("kitty-ide")
export const wsClientLogger = createKittyLogger("kitty-ide-ws")
export const terminalUILogger = createKittyLogger("kitty-ide-terminal")
export const previewUILogger = createKittyLogger("kitty-ide-preview")
export const explorerLogger = createKittyLogger("kitty-ide-workspace")
export const apiClientLogger = createKittyLogger("kitty-ide-api")
export const editorLogger = createKittyLogger("kitty-ide-editor")
export const projectLogger = createKittyLogger("kitty-ide-project")
export const importLogger = createKittyLogger("kitty-ide-import")
export const projectStoreLogger = createKittyLogger("kitty-ide-projectStore")