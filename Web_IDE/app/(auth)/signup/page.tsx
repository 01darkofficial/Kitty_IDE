
import AuthAside from "@/components/Auth/AuthAside"
import SignupForm from "@/components/Auth/SignupForm"

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

                <SignupForm />

                <AuthAside isSignup={true} />

            </div>

        </main>
    )
}