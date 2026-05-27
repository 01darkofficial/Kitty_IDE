import { Upload, ArrowRight } from "lucide-react"
import { FaGithub } from "react-icons/fa"

type Props = {
    onUploadClick: () => void
}

export default function ImportActions({
    onUploadClick,
}: Props) {

    return (
        <section className="space-y-2 border-t border-zinc-900">

            <button
                onClick={onUploadClick}
                className="group w-full border-b border-zinc-900 py-8 flex items-center justify-between hover:border-zinc-700 transition-colors"
            >

                <div className="flex items-start gap-6 text-left">

                    <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-zinc-300" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-medium text-zinc-100">
                            Upload ZIP
                        </h2>

                        <p className="mt-2 text-zinc-500 max-w-xl leading-relaxed">
                            Import a local project archive from your machine and continue development instantly.
                        </p>
                    </div>

                </div>

                <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />

            </button>

            <button className="group w-full border-b border-zinc-900 py-10 flex items-center justify-between hover:border-zinc-700 transition-colors">

                <div className="flex items-start gap-6 text-left">

                    <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <FaGithub className="h-6 w-6 text-zinc-300" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-medium text-zinc-100">
                            Clone Repository
                        </h2>

                        <p className="mt-2 text-zinc-500 max-w-xl leading-relaxed">
                            Connect GitHub, GitLab, or another Git provider and clone repositories directly.
                        </p>
                    </div>

                </div>

                <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />

            </button>

        </section>
    )
}