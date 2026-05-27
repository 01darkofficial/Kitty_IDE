import UploadZipBox from "./UploadZipBox"
import VersionSelector from "./VersionSelector"

type Props = {
    nodeVersion: string
    setNodeVersion: React.Dispatch<React.SetStateAction<string>>
    pnpmVersion: string
    setPnpmVersion: React.Dispatch<React.SetStateAction<string>>
}

export default function EnvironmentStep({
    nodeVersion,
    setNodeVersion,
    pnpmVersion,
    setPnpmVersion,
}: Props) {

    return (
        <div className="p-8">
            <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-600 mb-2">
                    Step 2
                </p>
                <h3 className="text-3xl font-semibold">
                    Environment configuration
                </h3>
            </div>
            <div className="space-y-6">
                <VersionSelector
                    title="Node.js Version"
                    versions={["22", "24", "25"]}
                    selected={nodeVersion}
                    onSelect={setNodeVersion}
                    prefix="Node"
                />
                <VersionSelector
                    title="PNPM Version"
                    versions={["8", "9", "10"]}
                    selected={pnpmVersion}
                    onSelect={setPnpmVersion}
                    prefix="pnpm"
                />
                <UploadZipBox
                    projectType="Node.js"
                    nodeVersion={nodeVersion}
                    pnpmVersion={pnpmVersion}
                />
            </div>
        </div>
    )
}