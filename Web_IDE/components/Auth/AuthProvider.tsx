// "use client"

// import { useEffect } from "react"
// import { initAuthListener } from "@/lib/api/initAuthListener"

// export default function AuthProvider({
//     children,
// }: {
//     children: React.ReactNode
// }) {
//     useEffect(() => {
//         const cleanup = initAuthListener()
//         return cleanup
//     }, [])

//     return <>{children}</>
// }