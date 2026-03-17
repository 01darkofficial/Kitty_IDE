import { Play } from "lucide-react"

export default function IDEHeader({ project, onRun }: any) {

    return (
        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4">

            <div className="font-semibold">
                {project.name}
            </div>

            <button
                onClick={onRun}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 rounded-md hover:bg-emerald-500 text-sm"
            >
                <Play size={16} />
                Run
            </button>

        </div>
    )
}