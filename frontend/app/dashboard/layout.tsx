"use client"

import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, loading, profile, profileLoading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!session) {
      redirect("/sign-in")
      return
    }
    if (!profileLoading && (!profile || !profile.onboarding_done)) {
      redirect("/onboarding")
    }
  }, [session, loading, profile, profileLoading])

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

  if (!profileLoading && (!profile || !profile.onboarding_done)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vibrant-red-orange"></div>
      </div>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}
