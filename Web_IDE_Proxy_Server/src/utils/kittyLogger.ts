const ENV = process.env.NODE_ENV || "development"

const IS_DEV = ENV === "development"

/**
 * Generates formatted log prefix.
 *
 * Format:
 * [timestamp] [service:LEVEL]
 *
 * Example:
 * [2026-04-14T10:22:33.123Z] [kitty-proxy:LOG]
 */
function createPrefix(service: string, level: string) {
    return `[${new Date().toISOString()}] [${service}:${level}]`
}

/**
 * Creates a scoped logger for a specific service/module.
 *
 * Logging behavior:
 * - LOG / DEBUG / WARN → development only
 * - ERROR → always logged
 *
 * This wrapper allows future migration to structured
 * logging (e.g., Pino) without changing call sites.
 */
export function createKittyLogger(service: string) {

    function kittyLog(...args: unknown[]) {
        if (IS_DEV) {
            console.log(createPrefix(service, "LOG"), ...args)
        }
    }

    function kittyDebug(...args: unknown[]) {
        if (IS_DEV) {
            console.debug(createPrefix(service, "DEBUG"), ...args)
        }
    }

    function kittyWarn(...args: unknown[]) {
        if (IS_DEV) {
            console.warn(createPrefix(service, "WARN"), ...args)
        }
    }

    function kittyError(...args: unknown[]) {
        console.error(createPrefix(service, "ERROR"), ...args)
    }

    return {
        kittyLog,
        kittyDebug,
        kittyWarn,
        kittyError
    }

}