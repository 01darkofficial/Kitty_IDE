import { describe, it, expect, vi, beforeEach }
    from "vitest"

import {
    terminalWss,
    setupTerminalWS
}
    from "../../../servers/wsTerminal"

import {
    MockWebSocket
}
    from "../../mocks/mockWebSocket"

import {
    createMockPty
}
    from "../../mocks/mockPty"

/*
Mock dependencies
*/

vi.mock(
    "node-pty",
    () => {

        const mockPty =
            createMockPty()

        return {

            spawn:
                vi.fn(
                    () => mockPty
                )

        }

    }
)

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
            vi.fn(() => false),

        registerWatcher:
            vi.fn()
    })
)

vi.mock(
    "@/runtime/fileWatcher",
    () => ({
        startFileWatcher:
            vi.fn(() => ({}))
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
    "@/runtime/runtimeMap",
    () => ({

        previewReadyMap:
            new Map(),

        previewPrintedMap:
            new Map()

    })
)

vi.mock(
    "@/runtime/activity",
    () => ({
        lastUsedMap:
            new Map()
    })
)

describe(
    "wsTerminal",
    () => {

        beforeEach(() => {

            vi.clearAllMocks()

            setupTerminalWS()

        })

        it(
            "should reject connection without projectId",
            async () => {

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

        it(
            "should accept valid projectId",
            async () => {

                const ws =
                    new MockWebSocket()

                terminalWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/terminal?projectId=p1"
                    }
                )

                expect(
                    ws.close
                ).not.toHaveBeenCalled()

            }
        )

        it(
            "should spawn PTY",
            async () => {

                const ws =
                    new MockWebSocket()

                const pty =
                    await import("node-pty")

                terminalWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/terminal?projectId=p1"
                    }
                )

                expect(
                    pty.spawn
                ).toHaveBeenCalled()

            }
        )

        it(
            "should send terminal output to socket",
            async () => {

                const ws =
                    new MockWebSocket()

                const pty =
                    await import("node-pty")

                const mockPty =
                    (pty.spawn as any)
                        .mock.results[0]
                        ?.value
                    ||
                    createMockPty()

                terminalWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/terminal?projectId=p1"
                    }
                )

                mockPty.emitData(
                    "hello"
                )

                expect(
                    ws.sent.length
                ).toBeGreaterThan(0)

            }
        )

        it(
            "should resize terminal",
            async () => {

                const ws =
                    new MockWebSocket()

                const pty =
                    await import("node-pty")

                const mockPty =
                    createMockPty()

                    ; (pty.spawn as any)
                        .mockReturnValue(
                            mockPty
                        )

                terminalWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/terminal?projectId=p1"
                    }
                )

                ws.emit(
                    "message",
                    JSON.stringify({
                        type:
                            "resize",
                        cols: 80,
                        rows: 24
                    })
                )

                expect(
                    mockPty.resize
                ).toHaveBeenCalled()

            }
        )

        it(
            "should write normal input to PTY",
            async () => {

                const ws =
                    new MockWebSocket()

                const pty =
                    await import("node-pty")

                const mockPty =
                    createMockPty()

                    ; (pty.spawn as any)
                        .mockReturnValue(
                            mockPty
                        )

                terminalWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/terminal?projectId=p1"
                    }
                )

                ws.emit(
                    "message",
                    "ls\n"
                )

                expect(
                    mockPty.write
                ).toHaveBeenCalled()

            }
        )

        it(
            "should cleanup PTY on close",
            async () => {

                const ws =
                    new MockWebSocket()

                const pty =
                    await import("node-pty")

                const mockPty =
                    createMockPty()

                    ; (pty.spawn as any)
                        .mockReturnValue(
                            mockPty
                        )

                terminalWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/terminal?projectId=p1"
                    }
                )

                ws.emit("close")

                expect(
                    mockPty.kill
                ).toHaveBeenCalled()

            }
        )

    }
)