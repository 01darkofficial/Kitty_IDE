import { create } from "zustand"
import { User } from "@supabase/supabase-js"
import { Profile } from "@/types/user"

type AuthState = {
    user: User | null
    profile: Profile | null
    loading: boolean

    setAuth: (user: User, profile: Profile) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    loading: true,

    setAuth: (user, profile) =>
        set({
            user,
            profile,
            loading: false,
        }),

    clearAuth: () =>
        set({
            user: null,
            profile: null,
            loading: false,
        }),
}))