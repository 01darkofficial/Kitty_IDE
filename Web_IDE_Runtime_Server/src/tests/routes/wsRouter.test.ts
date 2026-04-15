import { describe, it, expect, vi, beforeEach }
    from "vitest"

import { createMockDuplex }
    from "../mocks/mockDuplex"

/*
Terminal mock
*/

vi.mock("../../servers/wsTerminal", () => {

    const terminalHandleUpgrade = vi.fn()
    const terminalEmit = vi.fn()

    return {

        terminalWss: {

            handleUpgrade:
                terminalHandleUpgrade,

            emit:
                terminalEmit

        },

        terminalHandleUpgrade,
        terminalEmit

    }

})

/*
Project mock
*/

vi.mock("../../servers/wsProject", () => {

    const projectHandleUpgrade = vi.fn()
    const projectEmit = vi.fn()

    return {

        projectWss: {

            handleUpgrade:
                projectHandleUpgrade,

            emit:
                projectEmit

        },

        projectHandleUpgrade,
        projectEmit

    }

})

/*
Preview proxy mock
*/

vi.mock("../../servers/previewProxy", () => {

    const proxyWs = vi.fn()

    return {

        proxy: {

            ws:
                proxyWs

        },

        proxyWs

    }

})

/*
Shared runtime maps
*/

vi.mock("../../runtime/runtimeMap", () => {

    const runtimeMap =
        new Map()

    return {

        runtimeMap

    }

})

vi.mock("../../runtime/activity", () => {

    const lastUsedMap =
        new Map()

    return {

        lastUsedMap

    }

})

/*
Import mocks AFTER definition
*/

import * as terminalModule
    from "../../servers/wsTerminal"

import * as projectModule
    from "../../servers/wsProject"

import * as previewModule
    from "../../servers/previewProxy"

import * as runtimeModule
    from "../../runtime/runtimeMap"

import * as activityModule
    from "../../runtime/activity"

/*
Import router AFTER mocks
*/

import { handleUpgrade }
    from "../../servers/wsRouter"

/*
Extract spies
*/

const terminalHandleUpgrade =
    (terminalModule as any)
        .terminalHandleUpgrade

const projectHandleUpgrade =
    (projectModule as any)
        .projectHandleUpgrade

const proxyWs =
    (previewModule as any)
        .proxyWs

const runtimeMap =
    runtimeModule.runtimeMap

const lastUsedMap =
    activityModule.lastUsedMap

describe(
    "wsRouter.handleUpgrade",
    () => {

        beforeEach(() => {

            vi.clearAllMocks()

            runtimeMap.clear()
            lastUsedMap.clear()

        })

        /*
        TERMINAL WS
        */

        it(
            "should route terminal websocket",
            () => {

                const socket =
                    createMockDuplex()

                const result =
                    handleUpgrade(
                        {
                            url:
                                "/terminal?projectId=1",
                            headers: {}
                        } as any,
                        socket,
                        Buffer.alloc(0)
                    )

                expect(result)
                    .toBe(true)

                expect(
                    terminalHandleUpgrade
                ).toHaveBeenCalled()

            }
        )

        /*
        PROJECT WS
        */

        it(
            "should route project websocket",
            () => {

                const socket =
                    createMockDuplex()

                const result =
                    handleUpgrade(
                        {
                            url:
                                "/project?projectId=1",
                            headers: {}
                        } as any,
                        socket,
                        Buffer.alloc(0)
                    )

                expect(result)
                    .toBe(true)

                expect(
                    projectHandleUpgrade
                ).toHaveBeenCalled()

            }
        )

        /*
        PREVIEW WS
        */

        it(
            "should proxy preview websocket",
            () => {

                runtimeMap.set(
                    "abc",
                    {
                        host: "localhost",
                        port: 3000
                    }
                )

                const socket =
                    createMockDuplex()

                const result =
                    handleUpgrade(
                        {
                            url: "/",
                            headers: {
                                host:
                                    "abc.preview.localhost"
                            }
                        } as any,
                        socket,
                        Buffer.alloc(0)
                    )

                expect(result)
                    .toBe(true)

                expect(
                    proxyWs
                ).toHaveBeenCalled()

            }
        )

        /*
        RUNTIME MISSING
        */

        it(
            "should destroy socket if runtime missing",
            () => {

                const socket =
                    createMockDuplex()

                const result =
                    handleUpgrade(
                        {
                            url: "/",
                            headers: {
                                host:
                                    "abc.preview.localhost"
                            }
                        } as any,
                        socket,
                        Buffer.alloc(0)
                    )

                expect(result)
                    .toBe(true)

                expect(
                    socket.destroy
                ).toHaveBeenCalled()

            }
        )

        /*
        PORT ZERO
        */

        it(
            "should destroy socket if runtime port is 0",
            () => {

                runtimeMap.set(
                    "abc",
                    {
                        host: "localhost",
                        port: 0
                    }
                )

                const socket =
                    createMockDuplex()

                const result =
                    handleUpgrade(
                        {
                            url: "/",
                            headers: {
                                host:
                                    "abc.preview.localhost"
                            }
                        } as any,
                        socket,
                        Buffer.alloc(0)
                    )

                expect(result)
                    .toBe(true)

                expect(
                    socket.destroy
                ).toHaveBeenCalled()

            }
        )

        /*
        LAST USED UPDATE
        */

        it(
            "should update lastUsedMap on preview proxy",
            () => {

                runtimeMap.set(
                    "abc",
                    {
                        host: "localhost",
                        port: 3000
                    }
                )

                const socket =
                    createMockDuplex()

                handleUpgrade(
                    {
                        url: "/",
                        headers: {
                            host:
                                "abc.preview.localhost"
                        }
                    } as any,
                    socket,
                    Buffer.alloc(0)
                )

                expect(
                    lastUsedMap.has("abc")
                ).toBe(true)

            }
        )

        /*
        UNKNOWN ROUTE
        */

        it(
            "should return false for unknown route",
            () => {

                const socket =
                    createMockDuplex()

                const result =
                    handleUpgrade(
                        {
                            url: "/unknown",
                            headers: {}
                        } as any,
                        socket,
                        Buffer.alloc(0)
                    )

                expect(result)
                    .toBe(false)

            }
        )

    }
)