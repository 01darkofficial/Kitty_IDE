"use client"

import { motion, AnimatePresence } from "framer-motion"


type AuthAsideProps = {
    isSignup: boolean;
}

export default function AuthAside({ isSignup }: AuthAsideProps) {
    return (
        <div className="
            relative
            hidden
            md:flex
            flex-col
            justify-end
            p-10
            overflow-hidden
            bg-neutral-900
        ">

            {/* gradient background */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(circle at 85% 15%, rgba(255,255,255,0.08) 0%, transparent 40%),
                        radial-gradient(circle at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 45%),
                        radial-gradient(circle at 80% 75%, rgba(255,255,255,0.10) 0%, transparent 25%),
                        linear-gradient(to bottom right, #0a0a0a, #171717, #262626)
                    `
                }}
            />

            {/* large glow */}
            <div className="
                absolute
                -top-40
                -right-40
                w-125
                h-125
                rounded-full
                bg-neutral-100
                opacity-[0.04]
                blur-3xl
            "/>

            {/* medium glow */}
            <div className="
                absolute
                top-20
                right-10
                w-645
                h-65
                rounded-full
                bg-neutral-200
                opacity-[0.05]
                blur-2xl
            "/>

            {/* small glow */}
            <div className="
                absolute
                bottom-16
                right-16
                w-30
                h-30
                rounded-full
                bg-neutral-300
                opacity-[0.08]
                blur-xl
            "/>

            <AnimatePresence mode="wait">

                <motion.div
                    key={isSignup ? "signup" : "login"}
                    initial={{ x: isSignup ? 40 : -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: isSignup ? -40 : 40, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="relative z-10"
                >

                    {/* text */}
                    <div className="relative z-10">
                        {isSignup ? (
                            <h2 className="
                    text-neutral-100
                    text-3xl
                    font-semibold
                    leading-tight
                ">
                                Hello
                                <br />
                                Create your account
                            </h2>
                        )
                            : (
                                <h2 className="
                    text-neutral-100
                    text-3xl
                    font-semibold
                    leading-tight
                ">
                                    Hey
                                    <br />
                                    Welcome Back
                                </h2>
                            )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}