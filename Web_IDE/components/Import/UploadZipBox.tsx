"use client"

import { Package } from "lucide-react"
import { cleanZip } from "@/lib/import/cleanZip"
import { uploadProjectZip } from "@/lib/import/uploadProjectZip"
import { importLogger } from "@/utils/logger"
import { useRouter } from "next/navigation"
import { useProjectStore } from "@/store/projectStore"

type Props = {
    projectType: string
    nodeVersion: string
    pnpmVersion: string
}

export default function UploadZipBox({
    projectType,
    nodeVersion,
    pnpmVersion,
}: Props) {

    const router = useRouter()

    const addProject = useProjectStore(s => s.addProject)

    async function handleFileChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        try {
            const file = e.target.files?.[0]

            if (!file) return

            const cleanedZip = await cleanZip(file)

            const result = await uploadProjectZip({
                file: cleanedZip,
                filename: file.name,
                projectType,
                nodeVersion,
                pnpmVersion,
            })

            addProject(result.project)

            router.push(`/app/projects/${result.project.id}`)

            importLogger.kittyLog("upload success")

        } catch (err) {
            importLogger.kittyError(err)
        }
    }

    return (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 flex items-center justify-between">

            <div className="flex items-center gap-4">

                <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Package className="h-5 w-5 text-zinc-400" />
                </div>

                <div>

                    <h4 className="font-medium text-zinc-200">
                        Upload ZIP File
                    </h4>

                    <p className="text-sm text-zinc-500 mt-1">
                        node_modules and build folders are excluded automatically.
                    </p>

                </div>

            </div>

            <label className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors px-5 py-3 text-sm text-zinc-200 cursor-pointer">

                Select File

                <input
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleFileChange}
                />

            </label>

        </div>
    )
}