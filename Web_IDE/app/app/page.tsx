"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import QuickActions from "@/components/HomePage/QuickActions"
import RecentProjects from "@/components/HomePage/RecentProjects"
import CreateProjectDialog from "@/components/Projects/CreateProjectDialog"
import UploadFlowModal from "@/components/Import/UploadFlowModal"

export default function Home() {
    const profile = useAuthStore((s) => s.profile)
    const [openProjectDialog, setOpenProjectDialog] = useState(false)
    const [, setOpenCloneDialog] = useState(false)
    const [showUploadFlow, setShowUploadFlow] = useState(false)
    const [, setStep] = useState<1 | 2>(1)
    const [nodeVersion, setNodeVersion] = useState("22")
    const [pnpmVersion, setPnpmVersion] = useState("10")

    return (
        <main className="flex-1 overflow-auto bg-canvas">
            <div className="mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 lg:px-8 lg:pt-10 lg:pb-10">
                <section className="mb-8 lg:mb-12">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                        {profile?.username ?? "Developer"}'s Dashboard
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-foreground-muted sm:text-base">
                        Continue working where you left off.
                    </p>
                </section>

                <RecentProjects />

                <QuickActions
                    onCreate={() => setOpenProjectDialog(true)}
                    onImport={() => {
                        setShowUploadFlow(true)
                        setStep(1)
                    }}
                    onClone={() => setOpenCloneDialog(true)}
                />

                <CreateProjectDialog
                    open={openProjectDialog}
                    onOpenChange={setOpenProjectDialog}
                />

                <UploadFlowModal
                    open={showUploadFlow}
                    onClose={() => setShowUploadFlow(false)}
                    nodeVersion={nodeVersion}
                    setNodeVersion={setNodeVersion}
                    pnpmVersion={pnpmVersion}
                    setPnpmVersion={setPnpmVersion}
                />
            </div>
        </main>
    )
}