"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { SectionHeading } from "@/components/Settings/SectionHeading"

const inputClass =
    "w-full rounded-sm border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200/70"

type TotpFactor = {
    id: string
    friendly_name?: string | null
    status: "verified" | "unverified"
    factor_type: "totp"
}

type EnrolledTotp = {
    id: string
    qr_code: string
    secret: string
    uri: string
}

export function TwoFactorSettings() {
    const [factors, setFactors] = useState<TotpFactor[]>([])
    const [enrollment, setEnrollment] = useState<EnrolledTotp | null>(null)
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const loadFactors = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const { data, error: factorError } = await supabase.auth.mfa.listFactors()
            if (factorError) throw factorError
            setFactors((data.totp ?? []) as TotpFactor[])
        } catch (err) {
            console.error("Failed to load MFA factors:", err)
            setError("Could not load two-factor authentication status. Refresh and try again.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadFactors()
    }, [loadFactors])

    const verifiedFactors = factors.filter((factor) => factor.status === "verified")
    const pendingFactors = factors.filter((factor) => factor.status === "unverified")
    const enabled = verifiedFactors.length > 0

    const beginEnrollment = async () => {
        setSaving(true)
        setError("")
        setMessage("")
        try {
            // Remove stale, unverified enrollments before starting a new one.
            for (const factor of pendingFactors) {
                const { error: removeError } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
                if (removeError) throw removeError
            }

            const { data, error: enrollError } = await supabase.auth.mfa.enroll({
                factorType: "totp",
                friendlyName: "Kitty IDE authenticator",
            })
            if (enrollError) throw enrollError
            setEnrollment({
                id: data.id,
                qr_code: data.totp.qr_code,
                secret: data.totp.secret,
                uri: data.totp.uri,
            })
            setCode("")
        } catch (err) {
            console.error("Failed to start MFA enrollment:", err)
            setError("Could not start authenticator setup. Check your Supabase MFA configuration and try again.")
        } finally {
            setSaving(false)
            await loadFactors()
        }
    }

    const verifyEnrollment = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!enrollment) return
        if (!/^\d{6}$/.test(code.trim())) {
            setError("Enter the 6-digit code shown in your authenticator app.")
            return
        }

        setSaving(true)
        setError("")
        setMessage("")
        try {
            const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
                factorId: enrollment.id,
                code: code.trim(),
            })
            if (verifyError) throw verifyError
            setEnrollment(null)
            setCode("")
            setMessage("Two-factor authentication is now enabled.")
            await loadFactors()
        } catch (err) {
            console.error("Failed to verify MFA enrollment:", err)
            setError("That code could not be verified. Check your device's time and enter the latest code.")
        } finally {
            setSaving(false)
        }
    }

    const disableFactor = async (factorId: string) => {
        const confirmed = window.confirm(
            "Disable two-factor authentication for this account? You will lose this additional sign-in protection.",
        )
        if (!confirmed) return

        setSaving(true)
        setError("")
        setMessage("")
        try {
            const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId })
            if (unenrollError) throw unenrollError
            setMessage("Authenticator removed. Two-factor authentication is disabled if no verified factors remain.")
            await loadFactors()
        } catch (err) {
            console.error("Failed to remove MFA factor:", err)
            setError("Could not remove the authenticator. If your session requires additional verification, re-authenticate and try again.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <section className="rounded-sm border border-zinc-200 bg-white p-5 sm:p-6">
            <SectionHeading
                title="Two-factor authentication"
                description="Use an authenticator app to add a second verification step to sign-in."
            />

            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                    <ShieldCheck size={19} className="text-zinc-700" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-zinc-900">Authenticator app</p>
                        {loading ? (
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">Checking status…</span>
                        ) : (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${enabled ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                                {enabled ? "Enabled" : "Not enabled"}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Compatible with authenticator apps that support time-based one-time passwords (TOTP).
                    </p>
                </div>
                {!loading && !enabled && !enrollment && (
                    <button
                        type="button"
                        onClick={() => void beginEnrollment()}
                        disabled={saving}
                        className="shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                    >
                        {saving ? <LoaderCircle size={14} className="animate-spin" /> : "Set up"}
                    </button>
                )}
            </div>

            {enrollment && (
                <form onSubmit={verifyEnrollment} className="mt-5 space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900">Connect your authenticator</h3>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Scan this QR code in your authenticator app. Then enter the current 6-digit code to confirm setup. Do not share the QR code or secret.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4">
                        <img src={enrollment.qr_code} alt="Authenticator setup QR code" className="h-48 w-48 max-w-full" />
                        <div className="w-full">
                            <p className="text-xs font-medium text-zinc-700">Can't scan the QR code?</p>
                            <code className="mt-1 block break-all rounded bg-zinc-100 p-2 text-xs text-zinc-700">{enrollment.secret}</code>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="totp-verification-code" className="mb-1.5 block text-sm font-medium text-zinc-800">6-digit verification code</label>
                        <input
                            id="totp-verification-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            required
                            value={code}
                            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                            className={inputClass}
                            placeholder="123456"
                        />
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={() => { setEnrollment(null); setCode(""); setError(""); void loadFactors() }} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100">Cancel setup</button>
                        <button type="submit" disabled={saving || code.length !== 6} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50">
                            {saving && <LoaderCircle size={14} className="animate-spin" />}
                            Verify and enable
                        </button>
                    </div>
                </form>
            )}

            {verifiedFactors.map((factor) => (
                <div key={factor.id} className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-800">
                        <CheckCircle2 size={15} />
                        <span>{factor.friendly_name || "Authenticator app"} is verified.</span>
                    </div>
                    <button type="button" disabled={saving} onClick={() => void disableFactor(factor.id)} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">
                        Remove authenticator
                    </button>
                </div>
            ))}

            {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
            {message && <p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}
            <p className="mt-4 text-xs leading-5 text-zinc-400">
                MFA is managed by Supabase Auth. Configure TOTP MFA in your Supabase project and test the complete sign-in flow before relying on it for production security.
            </p>
        </section>
    )
}
