import { describe, it, expect, vi, beforeEach }
    from "vitest"

import {
    setupProjectWS,
    projectWss
}
    from "../../../servers/wsProject"

import {
    projectSockets
}
    from "../../../ws/projectSockets"

import {
    MockWebSocket
}
    from "../../mocks/mockWebSocket"

describe(
    "wsProject",
    () => {

        beforeEach(() => {

            projectSockets.clear()

        })

        it(
            "should register socket on valid projectId",
            () => {

                setupProjectWS()

                const ws =
                    new MockWebSocket()

                projectWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            "/project?projectId=abc"
                    }
                )

                expect(
                    projectSockets.has("abc")
                ).toBe(true)

            }
        )

        it(
            "should close socket if projectId missing",
            () => {

                setupProjectWS()

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

        it(
            "should remove socket on close event",
            () => {

                setupProjectWS()

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

        it(
            "should close socket if URL parsing fails",
            () => {

                setupProjectWS()

                const ws =
                    new MockWebSocket()

                projectWss.emit(
                    "connection",
                    ws,
                    {
                        url:
                            undefined
                    }
                )

                expect(
                    ws.close
                ).toHaveBeenCalled()

            }
        )

        it(
            "should not register duplicate listeners",
            () => {

                setupProjectWS()
                setupProjectWS()
                setupProjectWS()

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

        it(
            "should overwrite existing socket for same project",
            () => {

                setupProjectWS()

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

    }
)