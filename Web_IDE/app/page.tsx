import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Code2, FolderTree, TerminalSquare, Eye, Layers3 } from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { Button } from "@/components/shadcn/ui/button"

export default function LandingPage() {

  const TECH_STACK = ["Next.js", "TypeScript", "Monaco", "Tailwind CSS", "Supabase", "Node.js",]

  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden no-scrollbar bg-canvas text-foreground">
      <BackgroundGrid />

      <header className="sticky top-0 z-50 border-b border-outline bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Kitty IDE" width={30} height={30} />

            <span className="text-base font-semibold sm:text-lg">Kitty IDE</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="outline" className="rounded-xsm px-3 sm:px-4">
                Login
              </Button>
            </Link>

            <Link href="/signup">
              <Button className="rounded-xsm bg-neutral-900 text-neutral-0 hover:bg-neutral-800 px-3 sm:px-4">
                Signup
              </Button>
            </Link>
          </div>

        </div>
      </header>

      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-outline bg-surface px-3 py-1 text-xs font-medium text-foreground-muted shadow-sm">
              Browser IDE • Next.js • TypeScript
            </div>

            <h1 className="text-4xl font-semibold tracking-tight leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="inline sm:block">
                Build web applications{" "}
              </span>

              <span className="inline sm:block">
                directly in your browser.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-foreground-muted sm:text-lg">
              Kitty IDE combines a Monaco editor, integrated terminal, live preview,
              project management and Git-ready workflows into one lightweight browser
              workspace.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="h-11 w-full rounded-xsm bg-neutral-900 px-6 text-neutral-0 hover:bg-neutral-800 sm:w-auto">
                  Get Started
                </Button>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-xsm px-6 sm:w-auto"
                >
                  Login
                </Button>
              </Link>
            </div>

            <div
              className="mt-8 flex flex-wrap justify-center gap-2">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="rounded-xsm border border-outline bg-surface px-3 py-1 text-xs text-foreground-muted ">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-12 sm:mt-16 lg:mt-20">
            <IDEPreview />
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 lg:px-8">
          <div className="mb-12 max-w-xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-foreground-subtle">
              Features
            </p>

            <h2 className="text-3xl font-semibold tracking-tight">
              Everything needed for browser development.
            </h2>

            <p className="mt-4 leading-7 text-foreground-muted">
              Focused on speed, simplicity and a familiar development experience.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <FeatureCard
              icon={Code2}
              title="Monaco Editor"
              description="VS Code editing experience with syntax highlighting, tabs and keyboard shortcuts."
            />

            <FeatureCard
              icon={TerminalSquare}
              title="Integrated Terminal"
              description="Run Node.js applications without leaving the editor."
            />

            <FeatureCard
              icon={Eye}
              title="Live Preview"
              description="Instant preview for static web applications inside the IDE."
            />

            <FeatureCard
              icon={FolderTree}
              title="Project Workspace"
              description="Resizable explorer, editor tabs and workspace management built for productivity."
            />
          </div>
        </div>
      </section>

      <section id="workflow" className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-foreground-subtle">
              Workflow
            </p>

            <h2 className="text-3xl font-semibold tracking-tight">
              Build everything without leaving the browser.
            </h2>

            <p className="mt-4 leading-7 text-foreground-muted">
              Kitty IDE brings together editing, previewing, terminal access and
              project management into a single workspace built for modern web development.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <WorkflowCard
              icon={FolderTree}
              title="Project Workspace"
              description="Create, import or clone repositories into isolated workspaces with a familiar explorer."
            />

            <WorkflowCard
              icon={TerminalSquare}
              title="Integrated Terminal"
              description="Run npm, pnpm and Node.js commands directly inside your project environment."
            />

            <WorkflowCard
              icon={Eye}
              title="Live Preview"
              description="Preview HTML, CSS and React projects instantly while editing."
            />

            <WorkflowCard
              icon={Layers3}
              title="Resizable Layout"
              description="Explorer, editor, preview and terminal panels adapt to your workflow."
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-outline bg-surface-hover/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-foreground-subtle">
              Built With
            </p>

            <h2 className="text-3xl font-semibold tracking-tight">
              Modern web technologies.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {TECH_STACK.map((tech) => (
              <div
                key={tech}
                className="rounded-xsm border border-outline bg-surface py-5 text-center text-sm font-medium text-foreground transition-normal hover:bg-surface-hover"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="rounded-sm border border-outline bg-surface p-8 sm:p-10">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-foreground-subtle">
              Why Kitty IDE
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              A browser IDE focused on development, not configuration.
            </h2>

            <p className="mt-4 text-foreground-muted leading-7">
              Kitty IDE is designed to remove setup friction. Open a project,
              start a terminal, edit code, and preview your application in one
              workspace with a consistent interface.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Zero setup", "Start coding immediately."],
              ["Integrated terminal", "Run Node and PNPM inside the workspace."],
              ["Project management", "Create, import and organize projects."],
              ["Live preview", "See changes without leaving the editor."],
            ].map(([title, desc]) => (
              <div key={title}>
                <h3 className="font-medium text-foreground">{title}</h3>

                <p className="mt-2 text-sm text-foreground-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12 lg:px-8">
          <div className="rounded-sm border border-outline bg-surface p-10 shadow-sm">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-foreground-subtle">
                Ready to start?
              </p>

              <h2 className="text-3xl font-semibold tracking-tight">
                Start building with Kitty IDE.
              </h2>

              <p className="mt-5 leading-7 text-foreground-muted">
                A lightweight browser IDE focused on modern web development without
                unnecessary complexity.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link href="/signup">
                  <Button className="h-11 rounded-xsm bg-neutral-900 px-6 text-neutral-0 hover:bg-neutral-800">
                    Create Account
                    <ArrowRight size={18} />
                  </Button>
                </Link>

                <Link href="/login">
                  <Button variant="outline" className="h-11 rounded-xsm px-6">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-outline bg-surface-hover/30">
        <div className="mx-auto flex max-w-7xl items-center flex-col gap-5 px-4 py-4 text-sm text-foreground-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Kitty IDE"
              width={24}
              height={24}
              className="rounded"
            />

            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                Kitty IDE
              </span>

              <span className="text-xs text-foreground-subtle">
                Browser IDE • V1
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/login"
              className="transition-fast hover:text-foreground"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="transition-fast hover:text-foreground"
            >
              Signup
            </Link>

            <a
              href="#"
              className="flex items-center gap-2 transition-fast hover:text-foreground"
            >
              <FaGithub size={16} />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BackgroundGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft top glow */}
      <div className="absolute -top-56 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-neutral-900/6 blur-[140px]" />

      {/* Secondary glow */}
      <div className="absolute bottom-0 right-0 h-105 w-105 rounded-full bg-neutral-900/5 blur-[120px]" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--outline) 1px, transparent 1px),
            linear-gradient(to bottom, var(--outline) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.25), transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.25), transparent)",
        }}
      />
    </div>
  );
}

function IDEPreview() {
  return (
    <div className="overflow-hidden rounded-sm border border-neutral-border bg-neutral-900 shadow-lg">
      <div className="flex items-center gap-2 border-b border-neutral-border px-3 py-3 sm:px-4">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />

        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />

        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />

        <span className="ml-3 truncate text-xs text-neutral-400">
          Kitty IDE — Browser Workspace
        </span>
      </div>

      <div className="bg-neutral-900">
        <Image
          src="/IDEPreview.png"
          alt="Kitty IDE Preview"
          width={1920}
          height={1080}
          priority
          className="block w-full h-auto object-contain select-none" />
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-sm border border-outline bg-surface p-5 transition-normal hover:bg-surface-hover hover:shadow-md sm:p-6">
      <Icon className="mb-4 text-neutral-0" size={28} />

      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {title}
      </h3>

      <p className="text-sm leading-6 text-foreground-muted">
        {description}
      </p>
    </div>
  );
}

function WorkflowCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-sm border border-outline bg-surface p-6 transition-normal hover:bg-surface-hover hover:shadow-md">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xsm bg-neutral-900 text-neutral-0">
        <Icon size={20} />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {title}
      </h3>

      <p className="text-sm leading-6 text-foreground-muted">
        {description}
      </p>
    </div>
  );
}