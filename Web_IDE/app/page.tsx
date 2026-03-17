"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/shadcn/ui/button"
import { Code2, Zap, Folder } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 overflow-hidden">

      {/* Animated grid background */}
      <AnimatedGrid />

      {/* Header */}
      <header className="relative z-10 border-b border-neutral-800 bg-neutral-950/70 backdrop-blur">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Kitty IDE" width={28} height={28} />
            <span className="font-semibold text-lg">Kitty IDE</span>
          </div>

          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>

            <Link href="/signup">
              <Button>Signup</Button>
            </Link>
          </div>

        </div>

      </header>


      {/* Hero */}
      <main className="relative z-10">

        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>

            <h1 className="text-5xl font-semibold leading-tight mb-6">

              A minimal IDE
              <br />
              built for speed

            </h1>

            <p className="text-neutral-400 text-lg mb-8">
              Code, manage projects, and build directly in your browser.
              Fast, distraction-free, and designed for developers.
            </p>

            <div className="flex gap-4">

              <Link href="/signup">
                <Button className="px-6 py-5 text-base">
                  Get Started
                </Button>
              </Link>

              <Link href="/login">
                <Button variant="secondary" className="px-6 py-5 text-base">
                  Login
                </Button>
              </Link>

            </div>

          </div>


          {/* Right IDE Preview */}
          <IDEPreview />

        </div>


        {/* Features */}
        <div className="max-w-6xl mx-auto px-6 pb-24">

          <div className="grid md:grid-cols-3 gap-6">

            <FeatureCard
              icon={Code2}
              title="Fast Editor"
              description="Low latency editing optimized for performance."
            />

            <FeatureCard
              icon={Folder}
              title="Project Based"
              description="Manage and organize your development workflow."
            />

            <FeatureCard
              icon={Zap}
              title="Instant Startup"
              description="Open projects instantly with minimal overhead."
            />

          </div>

        </div>

      </main>


      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-800">

        <div className="max-w-6xl mx-auto px-6 py-6 text-neutral-500 text-sm">
          © 2026 Kitty IDE
        </div>

      </footer>

    </div>
  )
}

/* ---------------- Components ---------------- */

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 -z-10">

      {/* glow */}
      <div className="absolute -top-50 -left-50 w-125 h-125 bg-blue-500/10 rounded-full blur-[120px]" />

      {/* grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, #262626 1px, transparent 1px), linear-gradient(to bottom, #262626 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "gridMove 20s linear infinite",
        }}
      />

      <style jsx>{`
        @keyframes gridMove {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(40px);
          }
        }
      `}</style>

    </div>
  )
}



function IDEPreview() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl">

      {/* top bar */}
      <div className="border-b border-neutral-800 px-4 py-2 flex gap-2">

        <div className="w-3 h-3 bg-red-500 rounded-full" />
        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
        <div className="w-3 h-3 bg-green-500 rounded-full" />

      </div>

      {/* editor */}
      <div className="p-4 font-mono text-sm text-neutral-300">

        <div>
          <span className="text-purple-400">function</span>{" "}
          <span className="text-blue-400">hello</span>() {"{"}
        </div>

        <div className="ml-4 text-green-400">
          console.log("Hello world")
        </div>

        <div>{"}"}</div>

      </div>

    </div>
  )
}



function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition">

      <Icon size={28} className="mb-4 text-neutral-300" />

      <h3 className="font-medium mb-2">
        {title}
      </h3>

      <p className="text-sm text-neutral-400">
        {description}
      </p>

    </div>
  )
}