import { describe, it, expect } from "vitest"

import {
    loadRuntimeRegistry
} from "../../lib/runtime/loadRuntimeRegistry"

describe(
    "loadRuntimeRegistry",
    () => {

        it(
            "should load runtime registry from versions.json",
            async () => {

                const registry =
                    await loadRuntimeRegistry()

                expect(registry)
                    .toBeDefined()

                expect(registry.default)
                    .toBeDefined()

                expect(
                    registry.versions.length
                ).toBeGreaterThan(0)

            }
        )

        it(
            "should contain valid runtime entries",
            async () => {

                const registry =
                    await loadRuntimeRegistry()

                const first =
                    registry.versions[0]

                expect(first.node)
                    .toBeDefined()

                expect(first.pnpm)
                    .toBeDefined()

            }
        )

    }
)