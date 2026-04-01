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
      <div className="min-h-screen flex items-center justify-center bg-rippl-black">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-rippl-violet border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rippl-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rippl-violet/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="w-full max-w-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rippl-violet rounded-[20px] shadow-xl shadow-rippl-violet/30 mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome to Rippl<span className="text-rippl-violet">.</span></h1>
          <p className="text-rippl-gray text-base">Choose how you want to get started</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 text-sm font-medium text-red-100 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Role Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Clipper Option */}
          <button
            onClick={() => handleChoose("clipper")}
            disabled={loading !== null}
            className="group relative flex flex-col items-center text-center p-8 rounded-[32px] border border-rippl-black-3 bg-rippl-black-2/80 hover:border-rippl-violet-dim hover:shadow-2xl hover:shadow-rippl-violet/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-rippl-violet/10 flex items-center justify-center mb-6 group-hover:bg-rippl-violet transition-all duration-300">
              <Video className="w-8 h-8 text-rippl-violet group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="font-bold text-xl text-white mb-2">
              Join as Clipper
            </h3>
            <p className="text-sm text-rippl-gray leading-relaxed mb-4">
              Create content, join campaigns, and earn per view
            </p>
            <div className="flex items-center gap-1.5 text-xs font-black text-rippl-violet-soft opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </div>
            {loading === "clipper" && (
              <div className="absolute inset-0 bg-rippl-black/80 rounded-[32px] flex items-center justify-center backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm font-bold text-rippl-violet">
                  <div className="w-5 h-5 border-2 border-rippl-violet border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </div>
              </div>
            )}
          </button>

          {/* Creator Option */}
          <button
            onClick={() => handleChoose("creator")}
            disabled={loading !== null}
            className="group relative flex flex-col items-center text-center p-8 rounded-[32px] border border-rippl-black-3 bg-rippl-black-2/80 hover:border-rippl-violet-dim hover:shadow-2xl hover:shadow-rippl-violet/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-rippl-violet/10 flex items-center justify-center mb-6 group-hover:bg-rippl-violet transition-all duration-300">
              <Megaphone className="w-8 h-8 text-rippl-violet group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="font-bold text-xl text-white mb-2">
              Join as Creator
            </h3>
            <p className="text-sm text-rippl-gray leading-relaxed mb-4">
              Launch campaigns and grow your brand
            </p>
            <div className="flex items-center gap-1.5 text-xs font-black text-rippl-violet-soft opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </div>
            {loading === "creator" && (
              <div className="absolute inset-0 bg-rippl-black/80 rounded-[32px] flex items-center justify-center backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm font-bold text-rippl-violet">
                  <div className="w-5 h-5 border-2 border-rippl-violet border-t-transparent rounded-full animate-spin" />
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
