"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useRouter } from "next/navigation"

import { Button } from "@/components/shadcn/ui/button"
import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"
import OAuthButtons from "./oAuthButtons"

export default function LoginForm() {

    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleLogin() {

        setLoading(true)
        setError("")

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        setLoading(false)

        if (error) {
            setError(error.message)
            return
        }

        router.push("/app")
        router.refresh()
    }

    return (
        <div className="bg-neutral-900 p-10 flex flex-col justify-center">

            <h1 className="text-2xl font-semibold text-neutral-100 mb-8">
                LOGIN
            </h1>

            <div className="space-y-5">

                {/* email */}
                <div className="space-y-2">

                    <Label className="text-neutral-400">
                        Email
                    </Label>

                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                        className="bg-neutral-800 border-neutral-700 text-neutral-100"
                    />

                </div>

                {/* password */}
                <div className="space-y-2">

                    <Label className="text-neutral-400">
                        Password
                    </Label>

                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="bg-neutral-800 border-neutral-700 text-neutral-100"
                    />

                </div>

                {/* error */}
                {error && (
                    <p className="text-red-400 text-sm">
                        {error}
                    </p>
                )}

                {/* login button */}
                <Button
                    onClick={handleLogin}
                    disabled={loading}
                    className="
                        w-full
                        bg-neutral-100
                        text-neutral-900
                        hover:bg-neutral-300
                    "
                >
                    {loading ? "Signing in..." : "Sign In"}
                </Button>

                {/* signup redirect */}
                <p className="text-neutral-500 text-sm text-center">

                    Don’t have an account?{" "}

                    <span
                        onClick={() => router.push("/signup")}
                        className="
                            text-neutral-300
                            cursor-pointer
                            hover:underline
                        "
                    >
                        Create account
                    </span>

                </p>

            </div>
            <div className="relative flex items-center my-4">
                <div className="grow border-t border-neutral-700"></div>
                <span className="mx-3 text-neutral-500 text-sm">or</span>
                <div className="grow border-t border-neutral-700"></div>
            </div>

            <OAuthButtons />

        </div>
    )
}