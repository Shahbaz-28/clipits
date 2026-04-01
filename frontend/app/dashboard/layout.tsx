"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, profile, loading, profileLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!session) {
      router.replace("/sign-in")
      return
    }
    if (!profileLoading && (!profile || !profile.onboarding_done)) {
      router.replace("/onboarding")
    }
  }, [session, profile, profileLoading, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rippl-violet" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (!profileLoading && (!profile || !profile.onboarding_done)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rippl-violet" />
      </div>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}
