import { describe, it, expect, beforeEach }
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
    "Watcher Notification",
    () => {

        beforeEach(() => {

            projectSockets.clear()

        })

        it(
            "should notify workspace update",
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
                        type:
                            "workspace_updated"
                    }
                )

                expect(
                    ws.sent.length
                ).toBe(1)

            }
        )

    }
)