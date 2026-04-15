import { describe, it, expect, vi }
    from "vitest"

/*
Mock dependencies BEFORE importing server
*/

const mockServer = {

    on: vi.fn(),

    listen: vi.fn()

}

/*
HTTP server mock
*/

vi.mock(
    "../../servers/httpServer",
    () => ({
        createHTTPServer:
            vi.fn(() => mockServer)
    })
)

/*
Terminal WS mock
*/

const setupTerminalSpy =
    vi.fn()

vi.mock(
    "../../servers/wsTerminal",
    () => ({
        setupTerminalWS:
            setupTerminalSpy
    })
)

/*
Project WS mock  ← required now
*/

const setupProjectSpy =
    vi.fn()

vi.mock(
    "../../servers/wsProject",
    () => ({
        setupProjectWS:
            setupProjectSpy
    })
)

/*
Cleanup mock
*/

const cleanupSpy =
    vi.fn()

vi.mock(
    "../../runtime/cleanup",
    () => ({
        startCleanupLoop:
            cleanupSpy
    })
)

/*
Upgrade handler mock
*/

const upgradeSpy =
    vi.fn(() => true)

vi.mock(
    "../../servers/wsRouter",
    () => ({
        handleUpgrade:
            upgradeSpy
    })
)

describe(
    "Server bootstrap",
    () => {

        it(
            "should initialize server correctly",
            async () => {

                /*
                Import AFTER mocks
                */

                await import(
                    "../../server.js"
                )

                /*
                Terminal WS initialized
                */

                expect(
                    setupTerminalSpy
                ).toHaveBeenCalledTimes(1)

                /*
                Project WS initialized
                */

                expect(
                    setupProjectSpy
                ).toHaveBeenCalledTimes(1)

                /*
                Cleanup loop started
                */

                expect(
                    cleanupSpy
                ).toHaveBeenCalledTimes(1)

                /*
                Upgrade handler attached
                */

                expect(
                    mockServer.on
                ).toHaveBeenCalledWith(
                    "upgrade",
                    expect.any(Function)
                )

                /*
                Server listening
                */

                expect(
                    mockServer.listen
                ).toHaveBeenCalledWith(
                    4000,
                    expect.any(Function)
                )

            }
        )

    }
)