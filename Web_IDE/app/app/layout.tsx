import { redirect } from "next/navigation"
import HomePageSidebar from "@/components/Sidebar/Sidebar"
import AuthHydrator from "@/components/Auth/AuthHydrator"
import { getProfile, getUser } from "@/lib/api/user/user"
import { Toaster } from "sonner"
import { getProjects } from "@/lib/api/projects/project"
import ProjectHydrator from "./ProjectHydrater"

export default async function ProtectedLayout({ children, }: {
    children: React.ReactNode
}) {

    const user = await getUser()

    if (!user) redirect("/login")

    const profile = await getProfile(user.id);

    if (!profile) redirect("/login")

    const projects = await getProjects(user.id);

    return (
        <div className="flex h-dvh overflow-hidden bg-canvas">
            <AuthHydrator user={user} profile={profile} />
            <ProjectHydrator userId={user.id} projects={projects} />
            <HomePageSidebar />
            <div className="flex-1 overflow-auto">
                {children}
                <Toaster richColors />
            </div>
        </div>
    )
}