
/**
 * Names of directories and files ignored during
 * filesystem scans and watcher events.
 *
 * These entries are excluded to prevent heavy
 * or irrelevant directories from triggering
 * unnecessary processing.
 */
export const IGNORE_NAMES: Set<string> = new Set([

    "node_modules",
    ".git",
    ".pnpm",

    ".cache",
    ".turbo",

    "dist",
    "build",
    "out",

    ".next",

    ".idea",
    ".vscode",

    ".DS_Store",

    "coverage",
    "logs",
    ".env.local",
    ".npm",
    ".yarn",
    ".history"

])