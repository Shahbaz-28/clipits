"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading, profileLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading || profileLoading) return

    if (!user) {
      router.replace("/sign-in")
      return
    }

    if (!profile || profile.role !== "admin") {
      router.replace("/dashboard")
    }
  }, [user, profile, loading, profileLoading, router])

  if (loading || profileLoading || !user || !profile || profile.role !== "admin") {
    return (
      <div className="min-h-svh flex items-center justify-center text-muted-foreground text-sm">
        Checking admin access…
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true} className="min-h-svh">
      <AdminSidebar />
      <SidebarInset className="bg-background flex flex-col">
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
