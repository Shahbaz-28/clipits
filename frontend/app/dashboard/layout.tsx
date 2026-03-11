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
  const { session, loading, profile, profileLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Debug auth state in dashboard layout
    // eslint-disable-next-line no-console
    console.log("[dashboard/layout] auth state", {
      loading,
      hasSession: !!session,
      profileLoading,
      hasProfile: !!profile,
      onboardingDone: profile?.onboarding_done,
    })

    if (loading) return
    if (!session) {
      router.replace("/sign-in")
      return
    }
    if (!profileLoading && (!profile || !profile.onboarding_done)) {
      router.replace("/onboarding")
    }
  }, [session, loading, profile, profileLoading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vibrant-red-orange" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (!profileLoading && (!profile || !profile.onboarding_done)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vibrant-red-orange" />
      </div>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}
