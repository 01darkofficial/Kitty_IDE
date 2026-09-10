"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/shadcn/ui/button"
import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"
import OAuthButtons from "./oAuthButtons"
import { cn } from "@/lib/utils"

export default function LoginForm() {

    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleLogin() {

        setLoading(true)
        setError("")

        const { error } = await supabase.auth.signInWithPassword({ email, password, })

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
                        Welcome back
                    </h1>

                    <p className="text-sm sm:text-base text-foreground-muted">
                        Sign in to continue to Kitty IDE.
                    </p>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm text-foreground-muted">
                            Email
                        </Label>

                        <Input
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
                            placeholder="Enter your password"
                            disabled={loading}
                            className="h-10 sm:h-11 rounded-xsm border-outline bg-canvas text-foreground placeholder:text-foreground-subtle focus-visible:ring-2 focus-visible:ring-sidebar-active disabled:opacity-60 disabled:cursor-not-allowed" />
                    </div>

                    {error && (
                        <div className="rounded-xsm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={handleLogin}
                        disabled={loading}
                        className="h-10 sm:h-11 w-full rounded-xsm bg-neutral-900 text-neutral-0 hover:bg-neutral-700 disabled:bg-neutral-900-hover disabled:text-neutral-400 disabled:cursor-not-allowed transition-normal">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </Button>

                    <p className="text-center text-sm text-foreground-muted">
                        Don't have an account?{" "}

                        <span
                            onClick={() => {
                                if (!loading) router.push("/signup");
                            }}
                            className={cn(
                                "font-medium text-foreground transition-opacity hover:underline",
                                loading ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"
                            )}
                        >
                            Create account
                        </span>
                    </p>
                </div>

                <div className="relative my-6 flex items-center">
                    <div className="grow border-t border-outline" />

                    <span className="mx-4 text-xs uppercase tracking-wider text-foreground-subtle">
                        Or continue with
                    </span>

                    <div className="grow border-t border-outline" />
                </div>

                <OAuthButtons loading={loading} />
            </div>
        </div>
    );
}