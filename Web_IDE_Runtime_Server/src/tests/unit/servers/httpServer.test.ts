import {
    describe,
    it,
    expect,
    vi,
    beforeEach
}
    from "vitest"

/*
Mock dependencies BEFORE import
*/

vi.mock(
    "../../../servers/previewProxy",
    () => {

        const previewSpy =
            vi.fn(() => true)

        return {

            handlePreviewRequest:
                previewSpy,

            // expose spy
            previewSpy

        }

    }
)

/*
Mock app
*/

vi.mock(
    "../../../app",
    () => {

        const appSpy =
            vi.fn()

        return {

            default: appSpy,

            // expose spy
            appSpy

        }

    }
)


/*
Import after mocks
*/

import * as previewModule
    from "../../../servers/previewProxy"

import * as appModule
    from "../../../app"


import { createHTTPServer }
    from "../../../servers/httpServer"

const previewSpy =
    (previewModule as any).previewSpy

const appSpy =
    (appModule as any).appSpy

describe(
    "httpServer",
    () => {

        beforeEach(() => {

            vi.clearAllMocks()

        })

        /*
        PREVIEW ROUTE
        */

        it(
            "should route preview request",
            () => {

                previewSpy.mockReturnValue(true)

                const server =
                    createHTTPServer()

                const req: any = {
                    headers: {
                        host:
                            "abc.preview.localhost"
                    },
                    url: "/"
                }

                const res: any = {

                    writeHead: vi.fn(),

                    end: vi.fn(),

                    setHeader: vi.fn()

                }

                server.emit(
                    "request",
                    req,
                    res
                )

                expect(
                    previewSpy
                ).toHaveBeenCalled()

            }
        )

        /*
        PREVIEW SHORT-CIRCUIT
        */

        it(
            "should stop processing when preview handles request",
            () => {

                previewSpy.mockReturnValue(true)

                const server =
                    createHTTPServer()

                const req: any = {
                    headers: {
                        host:
                            "abc.preview.localhost"
                    },
                    url: "/"
                }

                const res: any = {

                    writeHead: vi.fn(),

                    end: vi.fn(),

                    setHeader: vi.fn()

                }

                server.emit(
                    "request",
                    req,
                    res
                )

                expect(
                    appSpy
                ).not.toHaveBeenCalled()

            }
        )

        /*
        LOCALHOST ROUTE
        */

        it(
            "should route localhost request to app",
            () => {

                previewSpy.mockReturnValue(false)

                const server =
                    createHTTPServer()

                const req: any = {
                    headers: {
                        host:
                            "localhost:4000"
                    }
                }

                const res: any = {

                    writeHead: vi.fn(),

                    end: vi.fn(),

                    setHeader: vi.fn()

                }

                server.emit(
                    "request",
                    req,
                    res
                )

                expect(
                    appSpy
                ).toHaveBeenCalled()

            }
        )

        /*
        LOCALHOST PREFIX ROUTE
        */

        it(
            "should route localhost prefixed host",
            () => {

                previewSpy.mockReturnValue(false)

                const server =
                    createHTTPServer()

                const req: any = {
                    headers: {
                        host:
                            "localhost:1234"
                    }
                }

                const res: any = {

                    writeHead: vi.fn(),

                    end: vi.fn(),

                    setHeader: vi.fn()

                }

                server.emit(
                    "request",
                    req,
                    res
                )

                expect(
                    appSpy
                ).toHaveBeenCalled()

            }
        )

        /*
        INVALID HOST
        */

        it(
            "should return 404 for invalid host",
            () => {

                const server =
                    createHTTPServer()

                const req: any = {
                    headers: {
                        host:
                            "evil.com"
                    }
                }

                const res: any = {

                    writeHead: vi.fn(),

                    end: vi.fn(),

                    setHeader: vi.fn()

                }

                server.emit(
                    "request",
                    req,
                    res
                )

                expect(
                    res.writeHead
                ).toHaveBeenCalledWith(404)

                expect(
                    res.end
                ).toHaveBeenCalledWith(
                    "Invalid host"
                )

            }
        )

    }
)