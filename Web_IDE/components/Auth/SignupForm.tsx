"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/shadcn/ui/button"
import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"
import { Checkbox } from "@/components/shadcn/ui/checkbox"
import OAuthButtons from "./oAuthButtons"
import { cn } from "@/lib/utils"

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
            options: { data: { username } }
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
        <div className="bg-surface flex h-full min-h-0 flex-col overflow-y-auto no-scrollbar">
            <div className="my-auto flex flex-col p-6 sm:p-8 lg:p-12">
                <div className="mb-8 space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                        Create your account
                    </h1>

                    <p className="text-sm sm:text-base text-foreground-muted">
                        Join Kitty IDE and start building immediately.
                    </p>
                </div>

                <OAuthButtons loading={loading} />

                <div className="relative my-6 flex items-center">
                    <div className="grow border-t border-outline" />

                    <span className="mx-4 text-xs uppercase tracking-wider text-foreground-subtle">
                        Or continue with email
                    </span>

                    <div className="grow border-t border-outline" />
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm text-foreground-muted">
                            Username
                        </Label>

                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your_username"
                            disabled={loading}
                            className="h-10 sm:h-11 rounded-xsm border-outline bg-canvas text-foreground placeholder:text-foreground-subtle focus-visible:ring-2 focus-visible:ring-sidebar-active disabled:opacity-60 disabled:cursor-not-allowed" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm text-foreground-muted">
                            Email
                        </Label>

                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            disabled={loading}
                            className="h-10 sm:h-11 rounded-xsm border-outline bg-canvas text-foreground placeholder:text-foreground-subtle focus-visible:ring-2 focus-visible:ring-sidebar-active disabled:opacity-60 disabled:cursor-not-allowed" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm text-foreground-muted">
                            Password
                        </Label>

                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            disabled={loading}
                            className="h-10 sm:h-11 rounded-xsm border-outline bg-canvas text-foreground placeholder:text-foreground-subtle focus-visible:ring-2 focus-visible:ring-sidebar-active disabled:opacity-60 disabled:cursor-not-allowed" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm text-foreground-muted">
                            Confirm Password
                        </Label>

                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            disabled={loading}
                            className="h-10 sm:h-11 rounded-xsm border-outline bg-canvas text-foreground placeholder:text-foreground-subtle focus-visible:ring-2 focus-visible:ring-sidebar-active disabled:opacity-60 disabled:cursor-not-allowed" />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <Checkbox
                            checked={remember}
                            disabled={loading}
                            onCheckedChange={(v) => setRemember(!!v)}
                        />

                        <Label className="text-sm text-foreground-muted">
                            Remember me on this device
                        </Label>
                    </div>

                    {error && (
                        <div className="rounded-xsm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={handleSignup}
                        disabled={loading}
                        className="h-10 sm:h-11 w-full rounded-xsm bg-neutral-900 text-neutral-0 hover:bg-neutral-700 disabled:bg-neutral-900-hover disabled:text-neutral-400 disabled:cursor-not-allowed transition-normal">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating account...
                            </span>
                        ) : (
                            "Create Account"
                        )}
                    </Button>

                    <p className="text-center text-sm text-foreground-muted">
                        Already have an account?{" "}

                        <span
                            onClick={() => { if (!loading) router.push("/login") }}
                            className={cn(
                                "font-medium text - foreground transition-opacity hover:underline",
                                loading ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"
                            )}
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div >
    )
}