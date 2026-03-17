"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const pathname = usePathname()
    const [displayChildren, setDisplayChildren] = useState(children)
    const [opacity, setOpacity] = useState(1)

    useEffect(() => {

        setOpacity(0)

        const timeout = setTimeout(() => {
            setDisplayChildren(children)
            setOpacity(1)
        }, 150)

        return () => clearTimeout(timeout)

    }, [pathname])

    return (
        <div
            style={{
                opacity,
                transition: "opacity 150ms ease"
            }}
        >
            {displayChildren}
        </div>
    )
}