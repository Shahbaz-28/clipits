"use client"

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
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
  const initialLoadDone = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
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
      setProfile(null)
    }
    setProfileLoading(false)
  }, [profile])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      lastUserId.current = null
      await fetchProfile(user.id)
    }
  }, [user?.id, fetchProfile])

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()

        if (!mounted) return

        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
          setLoading(false)
          initialLoadDone.current = true
          await fetchProfile(initialSession.user.id)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
          setProfileLoading(false)
          setLoading(false)
          initialLoadDone.current = true
        }
      } catch {
        if (!mounted) return
        setLoading(false)
        setProfileLoading(false)
        initialLoadDone.current = true
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return

      if (!initialLoadDone.current) return

      if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
        setProfile(null)
        setProfileLoading(false)
        lastUserId.current = null
        return
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          if (currentSession.user.id !== lastUserId.current) {
            await fetchProfile(currentSession.user.id)
          }
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    lastUserId.current = null
  }, [])

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
