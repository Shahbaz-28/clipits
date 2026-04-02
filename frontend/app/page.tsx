"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { WaitlistHero } from "@/components/waitlist-hero"
import { LandingHero } from "@/components/landing-hero"

// TOGGLE THIS FOR LAUNCH: 
// true = Waitlist Mode | false = Full Landing Page
const SHOW_WAITLIST = true;

export default function HomePage() {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && session) {
      router.push("/dashboard")
    }
  }, [session, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-rippl-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rippl-violet"></div>
      </div>
    )
  }

  return (
    <div suppressHydrationWarning>
      {SHOW_WAITLIST ? <WaitlistHero /> : <LandingHero />}
    </div>
  )
}
