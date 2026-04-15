import { describe, it, expect }
    from "vitest"

import {
    notifyProject,
    projectSockets
}
    from "../../../ws/projectSockets"

import {
    MockWebSocket
}
    from "../../mocks/mockWebSocket"

describe(
    "watcher burst notifications",
    () => {

        it(
            "should handle multiple notifications",
            () => {

                const ws =
                    new MockWebSocket()

                projectSockets.set(
                    "p1",
                    ws as any
                )

                for (
                    let i = 0;
                    i < 10;
                    i++
                ) {

                    notifyProject(
                        "p1",
                        { type: "update" }
                    )

                }

                expect(
                    ws.sent.length
                ).toBe(10)

            }
        )

    }
)