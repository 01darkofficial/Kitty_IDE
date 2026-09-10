"use client"

import { useState } from "react"
import { Globe, X, } from "lucide-react"
import { SiNodedotjs } from "react-icons/si"
import { cn } from "@/lib/utils"
import { Button } from "@/components/shadcn/ui/button"
import UploadZipBox from "./UploadZipBox"
import RuntimeEnvironment from "./RuntimeEnvironment"
import { cleanZip } from "@/lib/import/cleanZip"
import { uploadProjectZip } from "@/lib/import/uploadProjectZip"
import { useRouter } from "next/navigation"
import { useProjectStore } from "@/store/projectStore"
import { importLogger } from "@/utils/logger"

type UploadFlowModalProps = {
    open: boolean
    onClose: () => void
    nodeVersion: string
    setNodeVersion: React.Dispatch<React.SetStateAction<string>>
    pnpmVersion: string
    setPnpmVersion: React.Dispatch<React.SetStateAction<string>>
}

export default function UploadFlowModal({
    open,
    onClose,
    nodeVersion,
    setNodeVersion,
    pnpmVersion,
    setPnpmVersion,
}: UploadFlowModalProps) {

    const router = useRouter();

    const addProject = useProjectStore((s) => s.addProject);
    const [projectType, setProjectType] = useState<"node" | "static">("node");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!open) return null;

    async function handleImport() {
        if (!selectedFile || uploading) {
            return
        }

        try {
            setUploading(true);

            const cleanedZip = await cleanZip(selectedFile);
            const result = await uploadProjectZip({
                file: cleanedZip,
                filename: selectedFile.name,
                projectType: projectType === "node" ? "Node.js" : "Static",
                nodeVersion,
                pnpmVersion
            });

            addProject(result.project);
            onClose();

            router.push(`/app/projects/${result.project.id}`);
        }
        catch (err) {
            importLogger.kittyError(err);
        }
        finally {
            setUploading(false);
        }
    }

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
            <div className="flex w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto no-scrollbar rounded-sm border border-outline bg-surface shadow-xl">
                <div className="flex items-start justify-between border-b border-outline px-5 py-5 sm:px-6 lg:px-7">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Import ZIP Archive
                        </h2>

                        <p className="mt-1 text-sm text-foreground-subtle">
                            Import an existing project from a ZIP archive.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded p-1 text-foreground-subtle transition-colors hover:bg-surface-hover hover:text-foreground">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-8 px-5 py-5 sm:px-6 lg:px-7">
                    <section>
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-foreground">
                                Project Runtime
                            </h3>

                            <p className="mt-1 text-sm text-foreground-subtle">
                                Select the runtime used by this project.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setProjectType("node")}
                                className={cn(
                                    "flex items-center gap-3 rounded-sm border px-4 py-3 text-left transition-all",
                                    projectType === "node" ? "border-accent bg-surface-active" : "border-outline bg-surface hover:border-accent hover:bg-surface-hover"
                                )}
                            >
                                <SiNodedotjs className="h-5 w-5 text-[#5FA04E] shrink-0" />

                                <div>
                                    <h4 className="text-sm font-medium text-foreground">
                                        Node.js
                                    </h4>

                                    <p className="text-xs text-foreground-subtle">
                                        JavaScript runtime
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setProjectType("static")}
                                className={cn(
                                    "flex items-center gap-3 rounded-sm border px-4 py-3 text-left transition-all",
                                    projectType === "static" ? "border-accent bg-surface-active" : "border-outline bg-surface hover:border-accent hover:bg-surface-hover"
                                )}
                            >
                                <Globe
                                    className="h-5 w-5 text-foreground-muted shrink-0"
                                />

                                <div>
                                    <h4 className="text-sm font-medium text-foreground">
                                        Static
                                    </h4>

                                    <p className="text-xs text-foreground-subtle">
                                        HTML, CSS & JS
                                    </p>
                                </div>
                            </button>
                        </div>
                    </section>

                    <UploadZipBox
                        file={selectedFile}
                        setFile={setSelectedFile}
                        projectType={projectType}
                    />

                    {projectType === "node" && (
                        <RuntimeEnvironment
                            showAdvanced={showAdvanced}
                            setShowAdvanced={setShowAdvanced}
                            nodeVersion={nodeVersion}
                            setNodeVersion={setNodeVersion}
                            pnpmVersion={pnpmVersion}
                            setPnpmVersion={setPnpmVersion}
                        />
                    )}
                </div>

                <div className="border-t border-outline bg-canvas px-5 py-5 sm:px-6 lg:px-7">
                    <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                                {selectedFile ? selectedFile.name : "No archive selected"}
                            </p>

                            <p className="mt-1 text-xs text-foreground-subtle">
                                {projectType === "node"
                                    ? `Node ${nodeVersion} • pnpm ${pnpmVersion}`
                                    : "Static Project"}
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="h-11 w-full rounded-sm border-outline bg-surface text-foreground hover:bg-surface-hover sm:w-auto">
                                Cancel
                            </Button>

                            <Button
                                disabled={!selectedFile || uploading}
                                onClick={handleImport}
                                className="h-11 w-full rounded-sm bg-neutral-900 text-neutral-0 hover:bg-neutral-800-active sm:w-auto">
                                {uploading ? "Importing..." : "Import Project"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}