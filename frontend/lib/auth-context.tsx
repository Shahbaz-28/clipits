"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "./supabase"

export type UserRole = "clipper" | "creator" | "admin"

export interface UserProfile {
  role: UserRole
  onboarding_done: boolean
  first_name: string | null
  last_name: string | null
  username: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  profileLoading: boolean
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  profileLoading: true,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const lastUserId = useRef<string | null>(null)

  const fetchProfile = async (userId: string) => {
    if (lastUserId.current === userId && profile) return
    lastUserId.current = userId
    setProfileLoading(true)
    const { data, error } = await supabase
      .from("users")
      .select("role, onboarding_done, first_name, last_name, username")
      .eq("id", userId)
      .single()
    if (!error && data) {
      setProfile({
        role: (data.role as UserRole) || "clipper",
        onboarding_done: data.onboarding_done ?? false,
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        username: data.username ?? null,
      })
    } else {
      // eslint-disable-next-line no-console
      console.warn("[auth-context] profile fetch failed", error?.message)
      setProfile(null)
    }
    setProfileLoading(false)
  }

  const refreshProfile = async () => {
    if (user?.id) {
      lastUserId.current = null
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    let mounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return

      if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
        setProfile(null)
        setProfileLoading(false)
        setLoading(false)
        lastUserId.current = null
        return
      }

      if (currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
        setLoading(false)
        await fetchProfile(currentSession.user.id)
      } else if (event === "INITIAL_SESSION") {
        setLoading(false)
        setProfileLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    lastUserId.current = null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        profileLoading,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
