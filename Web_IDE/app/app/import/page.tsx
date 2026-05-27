"use client"

import { useState } from "react"

import ImportHero from "@/components/Import/ImportHero"
import ImportActions from "@/components/Import/ImportActions"
import UploadFlowModal from "@/components/Import/UploadFlowModal"

export default function ImportPage() {

    const [showUploadFlow, setShowUploadFlow] = useState(false)
    const [step, setStep] = useState<1 | 2>(1)

    const [projectType, setProjectType] = useState("Node.js")
    const [nodeVersion, setNodeVersion] = useState("22")
    const [pnpmVersion, setPnpmVersion] = useState("10")

    return (
        <div className="relative min-h-full bg-zinc-950 text-zinc-100 overflow-hidden">

            <div className="pointer-events-none absolute inset-0 opacity-40 overflow-hidden">
                <div className="absolute -top-30 -left-30 h-80 w-[320px] rounded-full bg-zinc-800 blur-3xl" />
                <div className="absolute -bottom-40 -right-30 h-80 w-[320px] rounded-full bg-zinc-900 blur-3xl" />
            </div>

            <div className="relative max-w-6xl mx-auto px-8 py-10">

                <ImportHero />

                <ImportActions
                    onUploadClick={() => {
                        setShowUploadFlow(true)
                        setStep(1)
                    }}
                />

                <UploadFlowModal
                    open={showUploadFlow}
                    onClose={() => setShowUploadFlow(false)}
                    step={step}
                    setStep={setStep}
                    projectType={projectType}
                    setProjectType={setProjectType}
                    nodeVersion={nodeVersion}
                    setNodeVersion={setNodeVersion}
                    pnpmVersion={pnpmVersion}
                    setPnpmVersion={setPnpmVersion}
                />

            </div>

        </div>
    )
}
