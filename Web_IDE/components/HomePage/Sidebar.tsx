"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/supabaseClient"


import {
    Home,
    Folder,
    LayoutTemplate,
    Upload,
    Settings,
    LogOut,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"

type NavItem = {
    name: string
    href: string
    icon: React.ElementType
}

const navItems: NavItem[] = [
    { name: "Home", href: "/app", icon: Home },
    { name: "Projects", href: "/app/projects", icon: Folder },
    { name: "Import", href: "/app/import", icon: Upload },
    { name: "Profile", href: "/app/profile", icon: LayoutTemplate },
    { name: "Settings", href: "/app/settings", icon: Settings },
]


async function logout() {
    await supabase.auth.signOut()
    window.location.href = "/"
}

export default function DashboardSidebar() {
    // const user = useAuthStore((state) => state.user)
    const profile = useAuthStore((s) => s.profile);
    return (
        <aside className="w-64 h-screen bg-neutral-950 border-r border-neutral-800 flex flex-col">

            {/* App Logo */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-800">

                {/* logo image */}
                <Image
                    src="/logo.jpg"
                    alt="logo"
                    width={28}
                    height={28}
                />

                {/* app name */}
                <span className="font-semibold text-white text-lg">
                    Kitty IDE
                </span>

            </div>


            {/* Profile section */}
            <div className="flex flex-col items-center pt-6 pb-6 border-b border-neutral-800">

                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-neutral-700">
                    <Image src="/logo.jpg" alt="profile" fill />
                </div>

                <span className="mt-3 text-sm text-neutral-200">
                    {profile?.username}
                </span>

            </div>

            {/* Middle nav section (slightly above center) */}
            <nav className="flex-1 flex flex-col pt-8">

                <div className="flex flex-col gap-1 px-3">

                    {navItems.map((item) => {
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md",
                                    "text-neutral-400 hover:text-white",
                                    "hover:bg-neutral-800",
                                    "transition-colors"
                                )}
                            >
                                <Icon size={18} />
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        )
                    })}

                </div>

            </nav>

            {/* Bottom logout section */}
            <div className="p-3 border-t border-neutral-800">

                <button
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                        "text-neutral-400 hover:text-red-400",
                        "hover:bg-neutral-800",
                        "transition-colors"
                    )}
                    onClick={logout}
                >
                    <LogOut size={18} />
                    <span className="text-sm">Logout</span>
                </button>

            </div>

        </aside>
    )
}