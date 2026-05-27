import { ChevronRight } from "lucide-react"
import { SiNodedotjs } from "react-icons/si"

type Props = {
    setProjectType: React.Dispatch<React.SetStateAction<string>>
    setStep: React.Dispatch<React.SetStateAction<1 | 2>>
}

export default function ProjectTypeStep({
    setProjectType,
    setStep,
}: Props) {

    return (
        <div className="p-8">

            <div className="mb-8">

                <p className="text-sm uppercase tracking-[0.2em] text-zinc-600 mb-2">
                    Step 1
                </p>

                <h3 className="text-3xl font-semibold">
                    Select project type
                </h3>

            </div>

            <div className="space-y-4">

                <button
                    onClick={() => {
                        setProjectType("Node.js")
                        setStep(2)
                    }}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all p-6 flex items-center justify-between"
                >

                    <div className="flex items-center gap-5">

                        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <SiNodedotjs className="h-7 w-7 text-zinc-300" />
                        </div>

                        <div className="text-left">

                            <h4 className="text-xl font-medium text-zinc-100">
                                Node.js
                            </h4>

                            <p className="mt-1 text-sm text-zinc-500">
                                JavaScript runtime environment.
                            </p>

                        </div>

                    </div>

                    <ChevronRight className="h-5 w-5 text-zinc-600" />

                </button>

            </div>

        </div>
    )
}