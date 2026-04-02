"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Mail, Lock, Eye, EyeOff, User } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function SignUpPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.session) {
        router.push("/onboarding")
        router.refresh()
      } else if (data.user && !data.session) {
        setError("Check your email for the confirmation link.")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError("")
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      })
      if (oauthError) setError(oauthError.message)
    } catch {
      setError("An unexpected error occurred")
    }
  }

  return (
    <div className="min-h-screen bg-rippl-black flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Decorative blurred background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rippl-violet/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rippl-violet/5 rounded-full blur-[128px] pointer-events-none" />

      <Card className="w-full max-w-md bg-rippl-black-2/80 backdrop-blur-xl border border-rippl-black-3 rounded-[32px] shadow-2xl relative z-10 overflow-hidden">
        <CardHeader className="text-center pt-6 pb-6 px-8">
          <div className="flex items-center justify-center mb-4 space-x-2">
            <div className="relative w-10 h-10">
              <img src="/logo.png" alt="Rippl" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Rippl<span className="text-rippl-violet">.</span></h1>
          </div>
          <CardTitle className="text-3xl font-extrabold text-white tracking-tight">Create Account</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-bold text-rippl-gray ml-1">First Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rippl-gray/50" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-11 h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/40 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet font-medium transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-bold text-rippl-gray ml-1">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rippl-gray/50" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-11 h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/40 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet font-medium transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-rippl-gray ml-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rippl-gray/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/40 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-rippl-gray ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rippl-gray/50" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/40 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet font-medium transition-all tracking-widest"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-rippl-gray/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs font-medium text-rippl-gray ml-1 mt-1">Password must be at least 6 characters</p>
            </div>

            {error && (
              <div className="text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg mt-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 mt-4 bg-rippl-violet hover:bg-rippl-violet/90 text-white rounded-xl font-bold shadow-lg shadow-rippl-violet/25 transition-all text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-rippl-black-3" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-rippl-gray">
              <span className="bg-rippl-black-2 px-4 shadow-[0_0_10px_10px_var(--tw-shadow-color)] shadow-rippl-black-2">OR CONTINUE WITH</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 bg-rippl-black-3/50 border-rippl-black-3 text-white hover:bg-rippl-black-3 hover:text-white rounded-xl font-bold transition-all text-sm group"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="mt-6 text-center text-sm font-medium text-rippl-gray">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-white hover:text-rippl-violet font-bold hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
