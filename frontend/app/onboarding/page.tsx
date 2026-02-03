"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, User, Megaphone } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, profileLoading, refreshProfile } = useAuth()
  const [loading, setLoading] = useState<"clipper" | "creator" | null>(null)
  const [error, setError] = useState("")

  // Already onboarded → go to dashboard
  useEffect(() => {
    if (!authLoading && !profileLoading && profile?.onboarding_done) {
      router.replace("/dashboard")
    }
  }, [authLoading, profileLoading, profile?.onboarding_done, router])

  const handleChoose = async (role: "clipper" | "creator") => {
    if (!user?.id) return
    setLoading(role)
    setError("")

    try {
      const { error: upsertError } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email ?? undefined,
          first_name: user.user_metadata?.first_name ?? user.user_metadata?.given_name ?? undefined,
          last_name: user.user_metadata?.last_name ?? user.user_metadata?.family_name ?? undefined,
          role,
          onboarding_done: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

      if (upsertError) {
        setError(upsertError.message)
        setLoading(null)
        return
      }

      await refreshProfile()
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(null)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-section-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-vibrant-red-orange border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vibrant-red-orange/5 to-turquoise-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-vibrant-red-orange rounded-lg flex items-center justify-center shadow-md shadow-vibrant-red-orange/30">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-heading-text">How do you want to join?</CardTitle>
          <CardDescription className="text-muted-label">
            Choose your path to get started on ClipIt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Clipper Option */}
            <button
              onClick={() => handleChoose("clipper")}
              disabled={loading !== null}
              className="group relative flex flex-col items-center text-center p-6 rounded-xl border-2 border-border bg-white hover:border-vibrant-red-orange hover:bg-vibrant-red-orange/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full bg-vibrant-red-orange/10 flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-vibrant-red-orange" />
              </div>
              <h3 className="font-semibold text-lg text-heading-text mb-2">
                Join as Clipper
              </h3>
              <p className="text-sm text-muted-label leading-relaxed">
                Post content, join campaigns, and earn per view
              </p>
              {loading === "clipper" && (
                <span className="mt-3 text-xs text-vibrant-red-orange">Setting up...</span>
              )}
            </button>

            {/* Creator Option */}
            <button
              onClick={() => handleChoose("creator")}
              disabled={loading !== null}
              className="group relative flex flex-col items-center text-center p-6 rounded-xl border-2 border-border bg-white hover:border-turquoise-accent hover:bg-turquoise-accent/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full bg-turquoise-accent/10 flex items-center justify-center mb-4">
                <Megaphone className="w-6 h-6 text-turquoise-accent" />
              </div>
              <h3 className="font-semibold text-lg text-heading-text mb-2">
                Join as Creator
              </h3>
              <p className="text-sm text-muted-label leading-relaxed">
                Run campaigns, review submissions.
              </p>
              {loading === "creator" && (
                <span className="mt-3 text-xs text-turquoise-accent">Setting up...</span>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
