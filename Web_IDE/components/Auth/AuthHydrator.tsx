"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { User } from "@supabase/supabase-js"
import { Profile } from "@/types/user"

export default function AuthHydrator({
    user,
    profile,
}: {
    user: User
    profile: Profile
}) {
    const setAuth = useAuthStore((s) => s.setAuth)

    useEffect(() => {
        setAuth(user, profile)
    }, [user, profile])

    return null
}