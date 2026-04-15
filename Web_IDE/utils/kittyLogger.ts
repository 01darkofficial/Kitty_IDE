
const ENV = process.env.NODE_ENV || "development"
const IS_DEV = ENV === "development"


function createPrefix(service: string, level: string) {
    const time = new Date().toISOString()
    return `[${time}] [${service}:${level}]`
}


/**
 * Frontend logger factory.
 *
 * Behavior:
 * - Development → log/debug/warn visible
 * - Production  → only errors visible
 *
 * Works in:
 * - Client components
 * - Server components
 * - API routes
 */
export function createKittyLogger(
    service: string
) {

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