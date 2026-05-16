
import { Upload, FolderGit2, ArrowRight } from "lucide-react"
import { FaGithub } from "react-icons/fa"
// import { Button } from "@/components/shadcn/ui/button"

export default function ImportPage() {
    return (
        <div className="relative min-h-full bg-zinc-950 text-zinc-100 overflow-hidden">

            <div className="pointer-events-none absolute inset-0 opacity-40 overflow-hidden">
                <div className="absolute -top-30 -left-30 h-80 w-80 rounded-full bg-zinc-800 blur-3xl" />
                <div className="absolute -bottom-40 -right-30 h-80 w-[320px] rounded-full bg-zinc-900 blur-3xl" />
            </div>

            <div className="relative max-w-6xl mx-auto px-8 py-10">

                <section className="mb-12 max-w-3xl">
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 mb-4">
                        Cloud Workspace
                    </p>

                    <h1 className="text-5xl font-semibold tracking-tight leading-none">
                        Import your
                        <span className="block text-zinc-500 mt-2">
                            existing projects
                        </span>
                    </h1>

                    <p className="mt-8 text-lg text-zinc-400 leading-relaxed max-w-2xl">
                        Continue working from anywhere by importing local projects or cloning repositories directly into your cloud IDE.
                    </p>
                </section>

                <section className="space-y-2 border-t border-zinc-900">

                    <button className="group w-full border-b border-zinc-900 py-8 flex items-center justify-between hover:border-zinc-700 transition-colors">

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

            </div>
        </div>
    )
}
