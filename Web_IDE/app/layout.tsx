import { ThemeProvider } from "@/components/themes/ThemeProvider"
import "./globals.css"
// import AuthProvider from "@/components/Auth/AuthProvider"
import { TooltipProvider } from "@/components/shadcn/ui/tooltip"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TooltipProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}