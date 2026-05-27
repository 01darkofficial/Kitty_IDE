import {
    describe, it,
    expect,
    vi,
    beforeEach,
} from "vitest"

import fs from "fs/promises"
import JSZip from "jszip"

import docker from "../../../runtime/docker"

import {
    runtimeMap,
    previewReadyMap,
} from "../../../runtime/runtimeMap"

import {
    lastUsedMap,
} from "../../../runtime/activity"

import {
    createProjectService,
    deleteProjectService,
} from "../../../services/project.service"

import {
    initialWorkspaceScan,
} from "../../../runtime/initialWorkspaceScan"

/* -------------------------------------------------------------------------- */
/*                                   Mocks                                    */
/* -------------------------------------------------------------------------- */

vi.mock("fs/promises", () => ({
    default: {
        mkdir: vi.fn(),
        writeFile: vi.fn(),
        rm: vi.fn(),
    },
}))

const mockStop =
    vi.fn()

const mockRemove =
    vi.fn()

const mockInspect =
    vi.fn()

vi.mock("../../../runtime/docker", () => ({
    default: {
        getContainer: vi.fn(() => ({
            inspect: mockInspect,
            stop: mockStop,
            remove: mockRemove,
        })),
    },
}))

vi.mock(
    "../../../runtime/runtimeMap",
    () => ({
        runtimeMap: new Map(),
        previewReadyMap: new Map(),
    })
)

vi.mock(
    "../../../runtime/activity",
    () => ({
        lastUsedMap: new Map(),
    })
)

vi.mock(
    "../../../runtime/initialWorkspaceScan",
    () => ({
        initialWorkspaceScan:
            vi.fn(),
    })
)

vi.mock(
    "../../../utils/logger",
    () => ({
        projectLogger: {
            kittyLog: vi.fn(),
            kittyError: vi.fn(),
        },
    })
)

/* -------------------------------------------------------------------------- */
/*                         createProjectService Tests                          */
/* -------------------------------------------------------------------------- */

describe(
    "createProjectService",
    () => {

        beforeEach(() => {

            vi.clearAllMocks()

            runtimeMap.clear()
            previewReadyMap.clear()
            lastUsedMap.clear()
        })

        it(
            "creates empty project workspace",
            async () => {

                const result =
                    await createProjectService({
                        projectId:
                            "project-1",

                        source:
                            "empty",
                    })

                expect(
                    fs.mkdir
                ).toHaveBeenCalled()

                expect(
                    initialWorkspaceScan
                ).not.toHaveBeenCalled()

                expect(result).toEqual({
                    success: true,
                })
            }
        )

        it(
            "extracts zip import into workspace",
            async () => {

                /*
                Create mock ZIP
                */

                const zip =
                    new JSZip()

                zip.file(
                    "package.json",
                    JSON.stringify({
                        name: "test",
                    })
                )

                zip.file(
                    "src/index.ts",
                    "console.log('hello')"
                )

                const buffer =
                    await zip.generateAsync({
                        type: "nodebuffer",
                    })

                /*
                Mock uploaded file
                */

                const mockFile = {
                    originalname:
                        "project.zip",

                    buffer,
                }

                await createProjectService({
                    projectId:
                        "project-2",

                    source:
                        "import",

                    files: [mockFile],
                })

                /*
                mkdir called
                */

                expect(
                    fs.mkdir
                ).toHaveBeenCalled()

                /*
                package.json written
                */

                expect(
                    fs.writeFile
                ).toHaveBeenCalledWith(
                    expect.stringContaining(
                        "package.json"
                    ),
                    expect.any(Buffer)
                )

                /*
                src/index.ts written
                */

                expect(
                    fs.writeFile
                ).toHaveBeenCalledWith(
                    expect.stringContaining(
                        "src/index.ts"
                    ),
                    expect.any(Buffer)
                )

                /*
                workspace scan triggered
                */

                expect(
                    initialWorkspaceScan
                ).toHaveBeenCalledWith(
                    "project-2"
                )
            }
        )

        it(
            "throws if import zip missing",
            async () => {

                await expect(
                    createProjectService({
                        projectId:
                            "project-3",

                        source:
                            "import",

                        files: [],
                    })
                ).rejects.toThrow(
                    "Import ZIP missing"
                )
            }
        )

        it(
            "prevents path traversal",
            async () => {

                const loadAsyncSpy =
                    vi.spyOn(
                        JSZip,
                        "loadAsync"
                    )

                loadAsyncSpy.mockResolvedValue({
                    files: {
                        "../../../evil.txt": {
                            dir: false,

                            unixPermissions:
                                0,

                            async: vi.fn()
                                .mockResolvedValue(
                                    Buffer.from(
                                        "hacked"
                                    )
                                ),
                        },
                    },
                } as any)

                const mockFile = {
                    originalname:
                        "evil.zip",

                    buffer:
                        Buffer.from("fake"),
                }

                await expect(
                    createProjectService({
                        projectId:
                            "project-4",

                        source:
                            "import",

                        files: [mockFile],
                    })
                ).rejects.toThrow(
                    "Invalid path"
                )

                loadAsyncSpy.mockRestore()
            }
        )

        it(
            "rejects symlinks",
            async () => {

                const loadAsyncSpy =
                    vi.spyOn(
                        JSZip,
                        "loadAsync"
                    )

                loadAsyncSpy.mockResolvedValue({
                    files: {
                        "evil-link": {
                            dir: false,

                            unixPermissions:
                                0o120000,

                            async: vi.fn(),
                        },
                    },
                } as any)

                const mockFile = {
                    originalname:
                        "evil.zip",

                    buffer:
                        Buffer.from("fake"),
                }

                await expect(
                    createProjectService({
                        projectId:
                            "project-5",

                        source:
                            "import",

                        files: [mockFile],
                    })
                ).rejects.toThrow(
                    "Symlink not allowed"
                )

                loadAsyncSpy.mockRestore()
            }
        )
    }
)

/* -------------------------------------------------------------------------- */
/*                         deleteProjectService Tests                          */
/* -------------------------------------------------------------------------- */

describe(
    "deleteProjectService",
    () => {

        beforeEach(() => {

            vi.clearAllMocks()

            runtimeMap.clear()
            previewReadyMap.clear()
            lastUsedMap.clear()
        })

        it(
            "deletes running container and workspace",
            async () => {

                mockInspect.mockResolvedValue({
                    State: {
                        Running: true,
                    },
                })

                const result =
                    await deleteProjectService(
                        "project-delete-1"
                    )

                expect(
                    docker.getContainer
                ).toHaveBeenCalledWith(
                    "project-project-delete-1"
                )

                expect(
                    mockStop
                ).toHaveBeenCalled()

                expect(
                    mockRemove
                ).toHaveBeenCalledWith({
                    force: true,
                })

                expect(
                    fs.rm
                ).toHaveBeenCalled()

                expect(result).toEqual({
                    success: true,
                })
            }
        )

        it(
            "deletes stopped container",
            async () => {

                mockInspect.mockResolvedValue({
                    State: {
                        Running: false,
                    },
                })

                await deleteProjectService(
                    "project-delete-2"
                )

                expect(
                    mockStop
                ).not.toHaveBeenCalled()

                expect(
                    mockRemove
                ).toHaveBeenCalled()
            }
        )

        it(
            "handles missing container",
            async () => {

                mockInspect.mockRejectedValue({
                    statusCode: 404,
                })

                const result =
                    await deleteProjectService(
                        "project-delete-3"
                    )

                expect(
                    fs.rm
                ).toHaveBeenCalled()

                expect(result).toEqual({
                    success: true,
                })
            }
        )

        it(
            "throws when workspace deletion fails",
            async () => {

                mockInspect.mockResolvedValue({
                    State: {
                        Running: false,
                    },
                })

                vi.mocked(
                    fs.rm
                ).mockRejectedValueOnce(
                    new Error(
                        "rm failed"
                    )
                )

                await expect(
                    deleteProjectService(
                        "project-delete-4"
                    )
                ).rejects.toThrow(
                    "rm failed"
                )
            }
        )

        it(
            "clears runtime memory maps",
            async () => {

                runtimeMap.set(
                    "project-delete-5",
                    {} as any
                )

                previewReadyMap.set(
                    "project-delete-5",
                    true
                )

                lastUsedMap.set(
                    "project-delete-5",
                    Date.now()
                )

                mockInspect.mockResolvedValue({
                    State: {
                        Running: false,
                    },
                })

                await deleteProjectService(
                    "project-delete-5"
                )

                expect(
                    runtimeMap.has(
                        "project-delete-5"
                    )
                ).toBe(false)

                expect(
                    previewReadyMap.has(
                        "project-delete-5"
                    )
                ).toBe(false)

                expect(
                    lastUsedMap.has(
                        "project-delete-5"
                    )
                ).toBe(false)
            }
        )
    }
)