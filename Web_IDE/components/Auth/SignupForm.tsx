"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useRouter } from "next/navigation"

import { Button } from "@/components/shadcn/ui/button"
import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"
import { Checkbox } from "@/components/shadcn/ui/checkbox"
import OAuthButtons from "./oAuthButtons"

export default function SignupForm() {

    const router = useRouter()

    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [remember, setRemember] = useState(false)

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSignup() {

        setError("")

        if (!email || !password || !username) {
            setError("All fields required")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username
                }
            }
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
        <div className="bg-neutral-900 p-10 flex flex-col justify-start overflow-y-auto max-h-137.5 no-scrollbar">

            <h1 className="text-2xl font-semibold text-neutral-100 mb-8">
                CREATE ACCOUNT
            </h1>

            <OAuthButtons />

            <div className="relative flex items-center my-4">
                <div className="grow border-t border-neutral-700"></div>
                <span className="mx-3 text-neutral-500 text-sm">or</span>
                <div className="grow border-t border-neutral-700"></div>
            </div>


            <div className="space-y-5">

                {/* username */}
                <div className="space-y-2">
                    <Label className="text-neutral-400">
                        Username
                    </Label>

                    <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your username"
                        className="bg-neutral-800 border-neutral-700 text-neutral-100"
                    />
                </div>

                {/* email */}
                <div className="space-y-2">
                    <Label className="text-neutral-400">
                        Email
                    </Label>

                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
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

                {/* confirm password */}
                <div className="space-y-2">
                    <Label className="text-neutral-400">
                        Confirm Password
                    </Label>

                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="bg-neutral-800 border-neutral-700 text-neutral-100"
                    />
                </div>

                {/* remember me */}
                <div className="flex items-center gap-2">

                    <Checkbox
                        checked={remember}
                        onCheckedChange={(v) => setRemember(!!v)}
                    />

                    <Label className="text-neutral-400 text-sm">
                        Remember me
                    </Label>

                </div>

                {/* error */}
                {error && (
                    <p className="text-red-400 text-sm">
                        {error}
                    </p>
                )}

                {/* button */}
                <Button
                    onClick={handleSignup}
                    disabled={loading}
                    className="
                        w-full
                        bg-neutral-100
                        text-neutral-900
                        hover:bg-neutral-300
                    "
                >
                    {loading ? "Creating account..." : "Create Account"}
                </Button>

                {/* login redirect */}
                <p className="text-neutral-500 text-sm text-center">

                    Already have an account?{" "}

                    <span
                        onClick={() => router.push("/login")}
                        className="text-neutral-300 cursor-pointer hover:underline"
                    >
                        Login
                    </span>

                </p>

            </div>

        </div>
    )
}