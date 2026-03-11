"use client"

import { createContext, useContext, useEffect, useState } from "react"
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

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true)
    // eslint-disable-next-line no-console
    console.log("[auth-context] fetching profile for", userId)
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
      setProfile(null)
    }
    setProfileLoading(false)
  }

  const refreshProfile = async () => {
    if (user?.id) await fetchProfile(user.id)
  }

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession()
      // eslint-disable-next-line no-console
      console.log("[auth-context] initial session", {
        hasSession: !!initialSession,
        userId: initialSession?.user?.id,
      })
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setLoading(false)
      if (initialSession?.user?.id) {
        await fetchProfile(initialSession.user.id)
      } else {
        setProfile(null)
        setProfileLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user?.id) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setProfileLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
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
