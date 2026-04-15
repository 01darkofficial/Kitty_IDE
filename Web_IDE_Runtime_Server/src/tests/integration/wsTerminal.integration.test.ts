import { describe, it, expect, vi, beforeEach }
    from "vitest"

import {
    setupTerminalWS,
    terminalWss
}
    from "../../servers/wsTerminal"

import {
    MockWebSocket
}
    from "../mocks/mockWebSocket"

/*
Mock runtime dependencies
*/

vi.mock(
    "@/runtime/ensureContainerRunning",
    () => ({
        ensureContainerRunning:
            vi.fn()
    })
)

vi.mock(
    "@/runtime/watcherRegistry",
    () => ({
        hasWatcher:
            vi.fn(() => true),

        registerWatcher:
            vi.fn()
    })
)

vi.mock(
    "@/runtime/fileWatcher",
    () => ({
        startFileWatcher:
            vi.fn()
    })
)

vi.mock(
    "@/runtime/initialWorkspaceScan",
    () => ({
        shouldRunInitialScan:
            vi.fn(() => false),

        initialWorkspaceScan:
            vi.fn()
    })
)

vi.mock(
    "@/runtime/detectDevPort",
    () => ({
        detectDevPort:
            vi.fn()
    })
)

vi.mock(
    "node-pty",
    () => ({

        spawn:
            vi.fn(() => ({

                onData: vi.fn(),

                write: vi.fn(),

                resize: vi.fn(),

                kill: vi.fn()

            }))

    })
)

describe(
    "wsTerminal Integration",
    () => {

        beforeEach(() => {

            setupTerminalWS()

        })

        it(
            "should accept valid projectId",
            () => {

                const ws =
                    new MockWebSocket()

                terminalWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/terminal?projectId=test"
                    }
                )

                expect(
                    ws.close
                ).not.toHaveBeenCalled()

            }
        )

        it(
            "should reject missing projectId",
            () => {

                const ws =
                    new MockWebSocket()

                terminalWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/terminal"
                    }
                )

                expect(
                    ws.close
                ).toHaveBeenCalled()

            }
        )

    }
)