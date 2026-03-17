
import { redirect } from "next/navigation"
import HomePageSidebar from "@/components/HomePage/Sidebar"
import AuthHydrator from "@/components/Auth/AuthHydrator"
import { getProfile, getUser } from "@/lib/api/user/user"

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const user = await getUser()

    if (!user) redirect("/login")

    const profile = await getProfile(user.id);

    if (!profile) redirect("/login")

    return (
        <div className="flex h-screen bg-neutral-950">
            <AuthHydrator user={user} profile={profile} />
            <HomePageSidebar />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}