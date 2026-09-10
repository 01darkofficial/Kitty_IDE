"use client";

import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { Terminal, FolderTree, Globe, Sparkles } from "lucide-react"

export default function AuthAside({ isSignup }: { isSignup: boolean }) {

    return (
        <div className="relative hidden h-full lg:flex flex-col justify-between overflow-hidden bg-neutral-900 p-10">
            <div className="absolute inset-0"
                style={{ background: `radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 35%), linear-gradient(160deg,#242424,#1c1c1c,#151515)`, }} />
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="space-y-10">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/logo.jpg"
                            alt="Kitty IDE"
                            width={48}
                            height={48}
                            className="rounded-lg"
                        />

                        <div>
                            <h1 className="text-lg font-semibold text-neutral-0">
                                Kitty IDE
                            </h1>

                            <p className="text-sm text-neutral-400">
                                Full Stack Developer Workspace
                            </p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isSignup ? "signup" : "login"}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-4"
                        >
                            <h2 className="text-4xl font-semibold leading-tight text-neutral-0">
                                {isSignup ? "Build anywhere. Start instantly." : "Welcome back to your workspace."}
                            </h2>

                            <p className="max-w-sm text-neutral-400 leading-7">
                                Code, preview and run full-stack applications with an
                                integrated editor, terminal and live runtime.
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <div className="space-y-4 pt-4 text-sm text-neutral-0">
                        <Feature icon={<Terminal size={18} />} text="Integrated terminal sessions" />
                        <Feature icon={<FolderTree size={18} />} text="Multi-project workspace" />
                        <Feature icon={<Globe size={18} />} text="Live browser preview" />
                        <Feature icon={<Sparkles size={18} />} text="Modern IDE experience" />
                    </div>
                </div>

                <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                    Kitty IDE • Version 1.0
                </div>
            </div>
        </div>
    );
}

function Feature({ icon, text }: {
    icon: React.ReactNode;
    text: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-700">
                {icon}
            </div>

            <span>{text}</span>
        </div>
    );
}