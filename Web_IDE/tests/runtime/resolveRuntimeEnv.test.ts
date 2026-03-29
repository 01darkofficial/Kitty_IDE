import { describe, it, expect }
    from "vitest"

import {
    resolveRuntimeEnv
}
    from "../../lib/runtime/resolveRuntimeEnv"

describe(
    "resolveRuntimeEnv",
    () => {

        it(
            "should resolve latest to default version",
            async () => {

                const result =
                    await resolveRuntimeEnv({
                        node: "latest"
                    })

                expect(result)
                    .toBeDefined()

                expect(result!.node)
                    .toBeDefined()

                expect(result!.pnpm)
                    .toBeDefined()

            }
        )

        it(
            "should resolve specific version correctly",
            async () => {

                const result =
                    await resolveRuntimeEnv({
                        node: "25"
                    })

                expect(result!.node)
                    .toBe("25")

            }
        )

        it(
            "should throw error for invalid version",
            async () => {

                await expect(
                    resolveRuntimeEnv({
                        node: "999"
                    })
                ).rejects.toThrow()

            }
        )

    }
)