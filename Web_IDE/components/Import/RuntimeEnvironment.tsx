"use client"

import { ChevronDown, Package, Server } from "lucide-react"
import VersionSelector from "./VersionSelector"
import { cn } from "@/lib/utils";

type RuntimeEnvironmentProps = {
    showAdvanced: boolean
    setShowAdvanced: React.Dispatch<React.SetStateAction<boolean>>
    nodeVersion: string
    setNodeVersion: React.Dispatch<React.SetStateAction<string>>
    pnpmVersion: string
    setPnpmVersion: React.Dispatch<React.SetStateAction<string>>
}

export default function RuntimeEnvironment({
    showAdvanced,
    setShowAdvanced,
    nodeVersion,
    setNodeVersion,
    pnpmVersion,
    setPnpmVersion,
}: RuntimeEnvironmentProps) {
    return (
        <section>
            <button
                type="button"
                onClick={() => setShowAdvanced(prev => !prev)}
                className="flex w-full items-center justify-between rounded-sm transition-colors">
                <div>
                    <h3 className="text-sm font-medium text-foreground">
                        Runtime Environment
                    </h3>

                    <p className="mt-1 text-sm text-foreground-subtle">
                        Optional. Defaults to the latest supported versions.
                    </p>
                </div>

                <ChevronDown
                    size={18}
                    className={cn(
                        "transition-transform duration-200",
                        showAdvanced ? "rotate-180" : ""
                    )}
                />
            </button>

            {showAdvanced && (
                <div className="mt-5 space-y-6 rounded-sm border border-outline bg-canvas p-5">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <Server
                                size={16}
                                className="text-foreground-muted"
                            />

                            <span className="text-sm font-medium text-foreground">
                                Node.js Version
                            </span>
                        </div>

                        <VersionSelector
                            versions={["25", "24", "22", "20"]}
                            selected={nodeVersion}
                            onSelect={setNodeVersion}
                            prefix="Node"
                        />
                    </div>

                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <Package
                                size={16}
                                className="text-foreground-muted"
                            />

                            <span
                                className="text-sm font-medium text-foreground">
                                pnpm Version
                            </span>
                        </div>

                        <VersionSelector
                            versions={["10", "9", "8"]}
                            selected={pnpmVersion}
                            onSelect={setPnpmVersion}
                            prefix="pnpm"
                        />
                    </div>
                </div>
            )}
        </section>
    );
}