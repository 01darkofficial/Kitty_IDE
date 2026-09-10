import LoginForm from "@/components/Auth/LoginForm"
import AuthAside from "@/components/Auth/AuthAside"

export default function LoginPage() {
    return (
        <main className="bg-canvas flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="grid w-full max-w-6xl overflow-hidden rounded-sm border border-outline bg-surface shadow-sm lg:grid-cols-[0.95fr_1.05fr] h-[min(760px,calc(100vh-2rem))] sm:h-[min(760px,calc(100vh-3rem))] lg:h-[min(780px,70vh)]">
                <AuthAside isSignup={false} />
                <LoginForm />
            </div>
        </main>
    )
}