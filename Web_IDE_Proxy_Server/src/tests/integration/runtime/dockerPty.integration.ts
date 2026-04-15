import { describe, it, expect } from "vitest"
import * as pty from "node-pty"

describe("Docker PTY", () => {

    const containerId =
        process.env.TEST_CONTAINER_ID

    if (!containerId) {

        it.skip(
            "skipped — TEST_CONTAINER_ID not set",
            () => { }
        )

        return

    }

    it(
        "should execute command inside container",
        async () => {

            let output = ""

            const ptyProcess =
                pty.spawn(
                    "docker",
                    [
                        "exec",
                        "-it",
                        containerId,
                        "bash",
                        "-lc",
                        "echo PTY_WORKING"
                    ],
                    {
                        name: "xterm-256color",
                        cols: 80,
                        rows: 30,
                        cwd: process.cwd(),
                        env: process.env
                    }
                )

            await new Promise<void>(
                (resolve) => {

                    ptyProcess.onData(
                        (data) => {

                            output += data

                            if (
                                output.includes(
                                    "PTY_WORKING"
                                )
                            ) {

                                resolve()

                            }

                        }
                    )

                }
            )

            expect(output)
                .toContain("PTY_WORKING")

        }
    )

})