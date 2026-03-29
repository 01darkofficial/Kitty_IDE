import { loadRuntimeRegistry }
    from "./loadRuntimeRegistry"

interface RuntimeEnv {

    node: string
    pnpm?: string

}

export async function resolveRuntimeEnv(
    runtimeEnv: RuntimeEnv | null
) {

    const registry =
        await loadRuntimeRegistry()

    // If runtime not provided
    if (!runtimeEnv) {

        const defaultVersion =
            registry.default

        const version =
            registry.versions.find(
                v =>
                    v.node === defaultVersion
            )

        return version
    }

    // If user selected "latest"
    if (
        runtimeEnv.node === "latest"
    ) {

        const defaultVersion =
            registry.default

        const version =
            registry.versions.find(
                v =>
                    v.node === defaultVersion
            )

        return version
    }

    // If user selected specific version

    const version =
        registry.versions.find(
            v =>
                v.node === runtimeEnv.node
        )

    if (!version) {

        throw new Error(
            `Unsupported runtime version: ${runtimeEnv.node}`
        )

    }

    return version

}