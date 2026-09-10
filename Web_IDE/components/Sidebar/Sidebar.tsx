"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Folder, Home, LogOut, Menu, Settings, Upload, X, } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useAuthStore } from "@/store/authStore"

type NavItem = {
    name: string
    href: string
    icon: React.ElementType
};

const navItems: NavItem[] = [
    {
        name: "Home",
        href: "/app",
        icon: Home,
    },
    {
        name: "Projects",
        href: "/app/projects",
        icon: Folder,
    },
    {
        name: "Repohub",
        href: "/app/repohub",
        icon: Upload,
    },
    {
        name: "Settings",
        href: "/app/settings",
        icon: Settings,
    },
];

async function logout() {
    await supabase.auth.signOut()
    window.location.href = "/"
}

export default function DashboardSidebar() {
    const profile = useAuthStore((s) => s.profile)
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const initial = profile?.username?.charAt(0).toUpperCase() ?? "U"

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false)
            }
        };

        window.addEventListener("keydown", onKeyDown)

        return () =>
            window.removeEventListener(
                "keydown",
                onKeyDown
            )
    }, [])

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-outline bg-canvas/95 px-4 backdrop-blur-md lg:hidden">
                <button
                    onClick={() => setOpen(true)}
                    className="rounded-xsm p-2 text-foreground transition-fast hover:bg-surface-active cursor-pointer">
                    <Menu size={22} />
                </button>

                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.jpg"
                        alt="Kitty IDE"
                        width={34}
                        height={34}
                        className="rounded"
                    />

                    <span className="font-semibold text-foreground">
                        Kitty IDE
                    </span>
                </div>

                <div className="w-10" />
            </div>
            <div
                onClick={() => setOpen(false)}
                className={cn(
                    "fixed inset-0 z-40 bg-black/45 transition-all duration-300 lg:hidden",
                    open ? "visible opacity-100" : "invisible opacity-0"
                )}
            />
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-border bg-neutral-900 shadow-lg transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:shadow-none",
                open ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between border-b border-neutral-border px-6 py-6">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/logo.jpg"
                            alt="Kitty IDE"
                            width={44}
                            height={44}
                            className="rounded"
                        />

                        <div>
                            <h1 className="text-base font-semibold text-neutral-0">
                                Kitty IDE
                            </h1>

                            <p className="mt-0.5 text-xs text-neutral-400 uppercase tracking-wider">
                                Developer Platform
                            </p>

                        </div>
                    </div>

                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-xsm p-2 text-neutral-400 transition-fast hover:bg-neutral-700-hover hover:text-neutral-0 lg:hidden cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    <div className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group relative flex items-center gap-3 overflow-hidden rounded-xsm px-4 py-3 text-sm font-medium transition-normal",
                                        active ? "bg-neutral-700 text-neutral-0" : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-0"
                                    )}
                                >

                                    <div className={cn(
                                        "absolute left-0 top-1/2 h-12 w-1 -translate-y-1/2 rounded-r-full bg-accent transition-all duration-300",
                                        active ? "opacity-100" : "opacity-0"
                                    )}
                                    />

                                    <Icon
                                        size={18}
                                        className={cn(
                                            "shrink-0 transition-transform duration-200",
                                            active && "scale-105"
                                        )}
                                    />

                                    <span>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="border-t border-neutral-border p-4">
                    <button className="flex  w-full items-center gap-3 rounded-xsm p-3 transition-normal hover:bg-neutral-800 cursor-pointer">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xsm bg-neutral-700 text-sm font-semibold text-neutral-0">
                            {initial}
                        </div>

                        <div className="min-w-0 flex-1 text-left">
                            <p className="truncate text-sm font-semibold text-neutral-0">
                                {profile?.username ?? "User"}
                            </p>

                            <p className="text-xs text-neutral-400">
                                Free Plan
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={logout}
                        className="mt-4 flex w-full items-center gap-3 rounded-xsm px-4 py-3 text-sm font-medium text-neutral-400 transition-normal hover:bg-neutral-800 hover:text-danger cursor-pointer">
                        <LogOut size={18} />

                        <span>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>
        </>
    )
}