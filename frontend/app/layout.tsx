import type React from "react"
import "@/app/globals.css"
import { plusJakartaSans } from "@/lib/fonts"

export const metadata = {
  title: "ClipIt",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body>{children}</body>
    </html>
  )
}
