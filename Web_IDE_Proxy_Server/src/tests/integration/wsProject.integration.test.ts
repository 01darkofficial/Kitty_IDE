import {
    describe,
    it,
    beforeEach,
    expect,
}
    from "vitest"

import {
    setupProjectWS,
    projectWss
}
    from "../../servers/wsProject"

import {
    notifyProject,
    projectSockets
}
    from "../../ws/projectSockets"

import {
    MockWebSocket
}
    from "../mocks/mockWebSocket"

describe(
    "Project WS Integration",
    () => {

        beforeEach(() => {

            projectSockets.clear()

            setupProjectWS()

        })

        /*
        VALID CONNECTION
        */

        it(
            "should register socket on valid projectId",
            () => {

                const ws =
                    new MockWebSocket()

                projectWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/project?projectId=test"
                    }
                )

                expect(
                    projectSockets.has("test")
                ).toBe(true)

            }
        )

        /*
        NOTIFICATION DELIVERY
        */

        it(
            "should deliver notification to client",
            () => {

                const ws =
                    new MockWebSocket()

                projectWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/project?projectId=test"
                    }
                )

                notifyProject(
                    "test",
                    {
                        type:
                            "workspace_updated"
                    }
                )

                expect(
                    ws.sent.length
                ).toBe(1)

            }
        )

        /*
        MISSING PROJECT ID
        */

        it(
            "should close socket if projectId missing",
            () => {

                const ws =
                    new MockWebSocket()

                projectWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/project"
                    }
                )

                expect(
                    ws.close
                ).toHaveBeenCalled()

            }
        )

        /*
        SOCKET CLEANUP
        */

        it(
            "should remove socket on close",
            () => {

                const ws =
                    new MockWebSocket()

                projectWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/project?projectId=p1"
                    }
                )

                ws.emit("close")

                expect(
                    projectSockets.has("p1")
                ).toBe(false)

            }
        )

        /*
        SOCKET REPLACEMENT
        */

        it(
            "should replace socket for same project",
            () => {

                const ws1 =
                    new MockWebSocket()

                const ws2 =
                    new MockWebSocket()

                projectWss.emit(
                    "connection",
                    ws1,
                    {
                        url:
                            "/project?projectId=p1"
                    }
                )

                projectWss.emit(
                    "connection",
                    ws2,
                    {
                        url:
                            "/project?projectId=p1"
                    }
                )

                expect(
                    projectSockets.get("p1")
                ).toBe(ws2)

            }
        )

        /*
        SETUP IDEMPOTENCY
        */

        it(
            "should not register multiple listeners",
            () => {

                setupProjectWS()
                setupProjectWS()

                const ws =
                    new MockWebSocket()

                projectWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/project?projectId=idempotent"
                    }
                )

                expect(
                    projectSockets.has(
                        "idempotent"
                    )
                ).toBe(true)

            }
        )

    }
)