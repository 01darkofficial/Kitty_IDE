import {
    describe,
    it,
    expect,
    vi,
    beforeEach
} from "vitest"

/*
Import shared mocks
*/

import {

    webMock,
    onMock,
    createProxyServerMock,

    readFileSyncMock,
    joinMock,

    resetRuntimeMocks

}
    from "../../mocks/mockProxy"

/*
Attach mocks to modules
*/

vi.mock("http-proxy", () => ({

    default: {

        createProxyServer:
            createProxyServerMock

    }

}))

vi.mock("fs", () => ({

    default: {

        readFileSync:
            readFileSyncMock

    }

}))

vi.mock("path", () => ({

    default: {

        join:
            joinMock

    }

}))

/*
Import system AFTER mocks
*/

import {
    handlePreviewRequest
}
    from "../../../servers/previewProxy"

import {
    runtimeMap
}
    from "../../../runtime/runtimeMap"

import {
    lastUsedMap
}
    from "../../../runtime/activity"

describe(
    "previewProxy",
    () => {

        beforeEach(() => {

            runtimeMap.clear()
            lastUsedMap.clear()

            resetRuntimeMocks()

        })

        it(
            "should proxy request when runtime exists",
            () => {

                runtimeMap.set(
                    "abc",
                    {
                        host: "localhost",
                        port: 3000
                    }
                )

                handlePreviewRequest(
                    {
                        headers: {
                            host:
                                "abc.preview.localhost"
                        }
                    },
                    {}
                )

                expect(
                    webMock
                ).toHaveBeenCalled()

            }
        )

        it(
            "should register error handler",
            () => {

                const calls =
                    onMock.mock.calls as
                    [string, Function][]

                const errorCall =
                    calls.find(
                        c => c[0] === "error"
                    )

                expect(errorCall)
                    .toBeDefined()

            }
        )

    }
)