import {
    describe,
    it,
    expect,
    beforeEach
}
    from "vitest"


import {
    projectSockets,
    notifyProject
}
    from "../../../ws/projectSockets"

import {
    MockWebSocket
}
    from "../../mocks/mockWebSocket"

describe(
    "projectSockets",
    () => {

        beforeEach(() => {

            projectSockets.clear()

        })

        /*
        SOCKET STORAGE
        */

        it(
            "should store socket per project",
            () => {

                const ws =
                    new MockWebSocket()

                projectSockets.set(
                    "p1",
                    ws as any
                )

                expect(
                    projectSockets.has("p1")
                ).toBe(true)

            }
        )

        /*
        NOTIFICATION DELIVERY
        */

        it(
            "should send payload to open socket",
            () => {

                const ws =
                    new MockWebSocket()

                projectSockets.set(
                    "p1",
                    ws as any
                )

                notifyProject(
                    "p1",
                    {
                        type: "test"
                    }
                )

                expect(
                    ws.sent.length
                ).toBe(1)

            }
        )

        /*
        JSON STRINGIFY
        */

        it(
            "should send JSON stringified payload",
            () => {

                const ws =
                    new MockWebSocket()

                projectSockets.set(
                    "p1",
                    ws as any
                )

                notifyProject(
                    "p1",
                    {
                        hello: "world"
                    }
                )

                expect(
                    ws.sent[0]
                ).toBe(
                    JSON.stringify({
                        hello: "world"
                    })
                )

            }
        )

        /*
        MISSING PROJECT
        */

        it(
            "should do nothing if project missing",
            () => {

                expect(() =>

                    notifyProject(
                        "missing",
                        {}
                    )

                ).not.toThrow()

            }
        )

        /*
        CLOSED SOCKET
        */

        it(
            "should not send if socket closed",
            () => {

                const ws =
                    new MockWebSocket()

                ws.readyState = 3

                projectSockets.set(
                    "p1",
                    ws as any
                )

                notifyProject(
                    "p1",
                    {}
                )

                expect(
                    ws.sent.length
                ).toBe(0)

            }
        )

        /*
        SOCKET REPLACEMENT
        */

        it(
            "should replace existing socket",
            () => {

                const ws1 =
                    new MockWebSocket()

                const ws2 =
                    new MockWebSocket()

                projectSockets.set(
                    "p1",
                    ws1 as any
                )

                projectSockets.set(
                    "p1",
                    ws2 as any
                )

                expect(
                    projectSockets.get("p1")
                ).toBe(ws2)

            }
        )

    }
)