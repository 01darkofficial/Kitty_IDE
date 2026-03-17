"use client"
import { useState } from "react"
import QuickActions from "@/components/HomePage/QuickActions"
import RecentProjects from "@/components/HomePage/RecentProjects"
import TemplatesSection from "@/components/HomePage/TemplatesSection"
import { useAuthStore } from "@/store/authStore"


export default function Home() {

    // const user = useAuthStore((state) => state.user);
    const profile = useAuthStore((s) => s.profile);

    const [refreshKey, setRefreshKey] =
        useState(0);

    function refreshProjects() {
        setRefreshKey(prev => prev + 1);
    }

    return (
        <div className="h-full flex flex-col bg-neutral-950 text-neutral-100">

            <div className="flex-1 overflow-auto">

                <div className="max-w-6xl mx-auto px-8 py-10">

                    {/* Welcome */}
                    <section className="mb-10">
                        <h1 className="text-3xl font-semibold">
                            Welcome back, {profile?.username}
                        </h1>

                        <p className="text-neutral-400 mt-2">
                            Create, manage, and open your projects.
                        </p>
                    </section>

                    <QuickActions onProjectCreated={refreshProjects} />

                    <RecentProjects />

                    <TemplatesSection />

                </div>

            </div>

        </div>
    )
}