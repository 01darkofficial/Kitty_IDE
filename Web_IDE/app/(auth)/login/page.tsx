import LoginForm from "@/components/Auth/LoginForm"
import AuthAside from "@/components/Auth/AuthAside"

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">

            <div className="
                w-full
                max-w-5xl
                grid
                md:grid-cols-2
                rounded-2xl
                overflow-hidden
                border
                border-neutral-800
                shadow-2xl
            ">

                <LoginForm />

                <AuthAside isSignup={false} />

            </div>

        </main>
    )
}