"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const role = profile?.role ?? "clipper"

  useEffect(() => {
    if (role === "admin") {
      router.replace("/admin")
    } else if (role === "creator") {
      router.replace("/dashboard/my-campaigns")
    } else {
      router.replace("/dashboard/explore")
    }
  }, [role, router])

  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-vibrant-red-orange border-t-transparent" />
    </div>
  )
}
