import { createKittyLogger } from "./kittyLogger";

/**
 * Central registry for service-specific loggers.
 *
 * Each logger represents a logical subsystem and
 * provides consistent logging prefixes across the app.
 */

export const serverLogger = createKittyLogger("kitty-runtime-server");
export const proxyLogger = createKittyLogger("kitty-runtime-proxy");
export const previewLogger = createKittyLogger("kitty-runtime-preview");
export const wsLogger = createKittyLogger("kitty-runtime-ws");
export const terminalLogger = createKittyLogger("kitty-runtime-terminal");
export const upgradeLogger = createKittyLogger("kitty-runtime-upgrade");
export const workspaceLogger = createKittyLogger("kitty-runtime-workspace");
