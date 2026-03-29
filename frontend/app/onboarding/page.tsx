"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Zap, Video, Megaphone, ArrowRight } from "lucide-react"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FF4B4B] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FF4B4B] rounded-2xl shadow-lg shadow-[#FF4B4B]/25 mb-5">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-heading-text mb-2">Welcome to Rippl </h1>
          <p className="text-muted-label">Choose how you want to get started</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Role Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Clipper Option */}
          <button
            onClick={() => handleChoose("clipper")}
            disabled={loading !== null}
            className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-gray-200 bg-white hover:border-[#FF4B4B] hover:shadow-lg hover:shadow-[#FF4B4B]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF4B4B]/10 flex items-center justify-center mb-4 group-hover:bg-[#FF4B4B] transition-colors duration-200">
              <Video className="w-7 h-7 text-[#FF4B4B] group-hover:text-white transition-colors duration-200" />
            </div>
            <h3 className="font-semibold text-lg text-heading-text mb-1.5">
              Join as Clipper
            </h3>
            <p className="text-sm text-muted-label leading-relaxed mb-3">
              Create content, join campaigns, and earn per view
            </p>
            <div className="flex items-center gap-1 text-xs font-medium text-[#FF4B4B] opacity-0 group-hover:opacity-100 transition-opacity">
              Get started <ArrowRight className="w-3 h-3" />
            </div>
            {loading === "clipper" && (
              <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm font-medium text-[#FF4B4B]">
                  <div className="w-4 h-4 border-2 border-[#FF4B4B] border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </div>
              </div>
            )}
          </button>

          {/* Creator Option */}
          <button
            onClick={() => handleChoose("creator")}
            disabled={loading !== null}
            className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-gray-200 bg-white hover:border-[#FF4B4B] hover:shadow-lg hover:shadow-[#FF4B4B]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF4B4B]/10 flex items-center justify-center mb-4 group-hover:bg-[#FF4B4B] transition-colors duration-200">
              <Megaphone className="w-7 h-7 text-[#FF4B4B] group-hover:text-white transition-colors duration-200" />
            </div>
            <h3 className="font-semibold text-lg text-heading-text mb-1.5">
              Join as Creator
            </h3>
            <p className="text-sm text-muted-label leading-relaxed mb-3">
              Launch campaigns and grow your brand
            </p>
            <div className="flex items-center gap-1 text-xs font-medium text-[#FF4B4B] opacity-0 group-hover:opacity-100 transition-opacity">
              Get started <ArrowRight className="w-3 h-3" />
            </div>
            {loading === "creator" && (
              <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm font-medium text-[#FF4B4B]">
                  <div className="w-4 h-4 border-2 border-[#FF4B4B] border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
