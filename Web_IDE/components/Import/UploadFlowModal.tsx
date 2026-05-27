import { X } from "lucide-react"

import ProjectTypeStep from "./ProjectTypeStep"
import EnvironmentStep from "./EnvironmentStep"

type Props = {
    open: boolean
    onClose: () => void

    step: 1 | 2
    setStep: React.Dispatch<React.SetStateAction<1 | 2>>

    projectType: string
    setProjectType: React.Dispatch<React.SetStateAction<string>>

    nodeVersion: string
    setNodeVersion: React.Dispatch<React.SetStateAction<string>>

    pnpmVersion: string
    setPnpmVersion: React.Dispatch<React.SetStateAction<string>>
}

export default function UploadFlowModal({
    open,
    onClose,

    step,
    setStep,

    projectType,
    setProjectType,

    nodeVersion,
    setNodeVersion,

    pnpmVersion,
    setPnpmVersion,
}: Props) {

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">

            <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">

                <div className="border-b border-zinc-800 px-8 py-6 flex items-center justify-between">

                    <div>
                        <h2 className="text-2xl font-semibold text-zinc-100">
                            Upload Project
                        </h2>

                        <p className="text-sm text-zinc-500 mt-1">
                            Configure the environment before importing.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-zinc-200 transition-colors"
                    >
                        <X />
                    </button>

                </div>

                {
                    step === 1 && (
                        <ProjectTypeStep
                            setProjectType={setProjectType}
                            setStep={setStep}
                        />
                    )
                }

                {
                    step === 2 && (
                        <EnvironmentStep
                            nodeVersion={nodeVersion}
                            setNodeVersion={setNodeVersion}
                            pnpmVersion={pnpmVersion}
                            setPnpmVersion={setPnpmVersion}
                        />
                    )
                }

            </div>

        </div>
    )
}