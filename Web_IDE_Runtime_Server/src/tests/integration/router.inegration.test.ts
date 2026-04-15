import { describe, it, expect, vi, beforeEach }
    from "vitest"

import {
    handleUpgrade
}
    from "../../servers/wsRouter"

import {
    createMockDuplex
}
    from "../mocks/mockDuplex"

import {
    runtimeMap
}
    from "../../runtime/runtimeMap"

import {
    proxy
}
    from "../../servers/previewProxy"

import {
    lastUsedMap
}
    from "../../runtime/activity"

describe(
    "Router Integration",
    () => {

        beforeEach(() => {

            runtimeMap.clear()

            lastUsedMap.clear()

            vi.clearAllMocks()

        })

        /*
        TERMINAL ROUTE
        */

        it(
            "should route terminal upgrade",
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

            }
        )

        /*
        PROJECT ROUTE
        */

        it(
            "should route project upgrade",
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

            }
        )

        /*
        PREVIEW SUCCESS
        */

        it(
            "should proxy preview websocket",
            () => {

                runtimeMap.set(
                    "abc",
                    {
                        host: "localhost",
                        port: 3000
                    } as any
                )

                const proxySpy =
                    vi.spyOn(
                        proxy,
                        "ws"
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

                expect(proxySpy)
                    .toHaveBeenCalled()

            }
        )

        /*
        PREVIEW RUNTIME MISSING
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
        PREVIEW INVALID PORT
        */

        it(
            "should destroy socket if runtime port is 0",
            () => {

                runtimeMap.set(
                    "abc",
                    {
                        host: "localhost",
                        port: 0
                    } as any
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
                    } as any
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
            "should return false for unknown routes",
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