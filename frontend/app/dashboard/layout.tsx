"use client"

import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading && !session) {
      redirect("/sign-in")
    }
  }, [session, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vibrant-red-orange"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
