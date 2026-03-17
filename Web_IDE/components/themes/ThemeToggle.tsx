"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/shadcn/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button
            variant="outline"
            onClick={toggleTheme}
        >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
    )
}