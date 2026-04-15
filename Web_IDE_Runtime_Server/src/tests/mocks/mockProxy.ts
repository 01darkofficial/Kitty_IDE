import { vi } from "vitest"

/*
HTTP PROXY MOCKS
*/

export const webMock =
    vi.fn()

export const wsMock =
    vi.fn()

export const onMock =
    vi.fn()

export const createProxyServerMock =
    vi.fn(() => ({

        web: webMock,
        ws: wsMock,
        on: onMock

    }))

/*
FS MOCK
*/

export const readFileSyncMock =
    vi.fn(() =>
        "<html>{{ERROR_MESSAGE}}</html>"
    )

/*
PATH MOCK
*/

export const joinMock =
    vi.fn(() =>
        "mockTemplate.html"
    )

/*
Reset helper
*/

export function resetAllMocks() {

    webMock.mockClear()
    wsMock.mockClear()
    onMock.mockClear()

    createProxyServerMock.mockClear()

    readFileSyncMock.mockClear()

    joinMock.mockClear()

}

export function resetRuntimeMocks() {

    webMock.mockClear()

}