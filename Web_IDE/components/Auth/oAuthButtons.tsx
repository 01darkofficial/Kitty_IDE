import { Button } from "@/components/shadcn/ui/button"

export default function OAuthButtons() {

    return (
        <div className="space-y-3">

            {/* Google */}
            <Button
                variant="outline"
                className="
                    w-full
                    bg-neutral-800
                    border-neutral-700
                    text-neutral-200
                    hover:bg-neutral-700
                    flex
                    items-center
                    justify-center
                    gap-2
                "
            >
                <GoogleIcon />
                Continue with Google
            </Button>

            {/* GitHub */}
            <Button
                variant="outline"
                className="
                    w-full
                    bg-neutral-800
                    border-neutral-700
                    text-neutral-200
                    hover:bg-neutral-700
                    flex
                    items-center
                    justify-center
                    gap-2
                "
            >
                <GithubIcon />
                Continue with GitHub
            </Button>

        </div>
    )
}


/* Google SVG */
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.69 1.22 9.18 3.6l6.85-6.85C35.64 2.4 30.2 0 24 0 14.61 0 6.48 5.48 2.44 13.44l7.98 6.2C12.5 13.5 17.8 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.14-3.13-.4-4.6H24v9h12.7c-.55 2.96-2.2 5.46-4.7 7.14l7.28 5.66C43.9 37.36 46.5 31.5 46.5 24.5z" />
            <path fill="#FBBC05" d="M10.42 28.64A14.5 14.5 0 019.5 24c0-1.6.27-3.13.92-4.64l-7.98-6.2A23.94 23.94 0 000 24c0 3.87.92 7.53 2.44 10.84l7.98-6.2z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.92-2.14 15.9-5.82l-7.28-5.66c-2.02 1.36-4.6 2.16-8.62 2.16-6.2 0-11.5-4-13.58-9.5l-7.98 6.2C6.48 42.52 14.61 48 24 48z" />
        </svg>
    )
}


/* GitHub SVG */
function GithubIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.17c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.52-2.55-.29-5.24-1.27-5.24-5.64 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.17a10.9 10.9 0 015.72 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.73.8 1.18 1.82 1.18 3.07 0 4.38-2.7 5.34-5.27 5.63.41.36.77 1.08.77 2.17v3.22c0 .3.21.66.79.55C20.71 21.39 24 17.08 24 12 24 5.65 18.85.5 12 .5z" />
        </svg>
    )
}