"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, CheckCircle, Instagram, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { authFetch } from "@/lib/api-client"

const CODE_EXPIRY_MINUTES = 10

function generateVerificationCode(): string {
  const DIGITS = "0123456789"
  const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"

  let numericPart = ""
  for (let i = 0; i < 6; i++) {
    numericPart += DIGITS[Math.floor(Math.random() * DIGITS.length)]
  }

  let alphaPart = ""
  for (let i = 0; i < 2; i++) {
    alphaPart += LETTERS[Math.floor(Math.random() * LETTERS.length)]
  }

  return `${numericPart}${alphaPart}`
}

function extractUsernameFromUrl(input: string): string | null {
  const trimmed = input.trim().replace(/\/+$/, "")
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    if (url.hostname.includes("instagram.com")) {
      const parts = url.pathname.replace(/^\/+/, "").split("/")
      const uname = parts[0]?.replace(/^@/, "")
      return uname || null
    }
  } catch {
    // not a URL
  }
  const raw = trimmed.replace(/^@/, "")
  if (/^[a-zA-Z0-9._]{1,30}$/.test(raw)) return raw
  return null
}

type Step = "enter-url" | "verify-code"

interface VerifyInstagramModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
}

export function VerifyInstagramModal({ isOpen, onClose, onVerified }: VerifyInstagramModalProps) {
  const { user } = useAuth()

  const [step, setStep] = useState<Step>("enter-url")
  const [profileUrl, setProfileUrl] = useState("")
  const [username, setUsername] = useState("")
  const [urlError, setUrlError] = useState("")

  const [accountId, setAccountId] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [codeGeneratedAt, setCodeGeneratedAt] = useState<Date | null>(null)
  const [copied, setCopied] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState("")

  const [timeLeft, setTimeLeft] = useState(CODE_EXPIRY_MINUTES * 60)

  const resetState = useCallback(() => {
    setStep("enter-url")
    setProfileUrl("")
    setUsername("")
    setUrlError("")
    setAccountId(null)
    setCode("")
    setCodeGeneratedAt(null)
    setCopied(false)
    setVerifying(false)
    setVerifyError("")
    setTimeLeft(CODE_EXPIRY_MINUTES * 60)
  }, [])

  useEffect(() => {
    if (isOpen) {
      resetState()
    }
  }, [isOpen, resetState])

  useEffect(() => {
    if (step !== "verify-code" || !codeGeneratedAt) return
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - codeGeneratedAt.getTime()) / 1000)
      const remaining = CODE_EXPIRY_MINUTES * 60 - elapsed
      if (remaining <= 0) {
        setTimeLeft(0)
        clearInterval(interval)
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [step, codeGeneratedAt])

  const handleStartVerification = async () => {
    setUrlError("")
    const uname = extractUsernameFromUrl(profileUrl)
    if (!uname) {
      setUrlError("Please enter a valid Instagram profile URL or username.")
      return
    }
    if (!user?.id) return

    setUsername(uname)
    const newCode = generateVerificationCode()
    setCode(newCode)
    setCodeGeneratedAt(new Date())

    const { data: existingAccounts } = await supabase
      .from("user_instagram_accounts")
      .select("id")
      .eq("user_id", user.id)
      .ilike("username", uname)

    if (existingAccounts && existingAccounts.length > 0) {
      const existing = existingAccounts[0]
      const { error } = await supabase
        .from("user_instagram_accounts")
        .update({ verification_code: newCode, verified_at: null })
        .eq("id", existing.id)
      if (error) {
        toast.error("Could not save verification code. Please try again.")
        return
      }
      setAccountId(existing.id)
    } else {
      const { data: inserted, error } = await supabase
        .from("user_instagram_accounts")
        .insert({
          user_id: user.id,
          username: uname,
          verification_code: newCode,
          is_default: false,
        })
        .select("id")
        .single()
      if (error || !inserted) {
        toast.error("Could not save verification code. Please try again.")
        return
      }
      setAccountId(inserted.id)
    }

    setStep("verify-code")
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Code copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy")
    }
  }

  const handleVerify = async () => {
    if (!user?.id || !code || !accountId) return
    if (timeLeft <= 0) {
      setVerifyError("Code has expired. Please go back and start again.")
      return
    }

    setVerifying(true)
    setVerifyError("")

    try {
      const res = await authFetch("/api/instagram/verify-bio", {
        method: "POST",
        body: JSON.stringify({ username, code, accountId }),
      })

      const data = await res.json()

      if (data.verified) {
        const { data: existingAccounts } = await supabase
          .from("user_instagram_accounts")
          .select("id")
          .eq("user_id", user.id)
          .not("id", "eq", accountId)

        if (!existingAccounts || existingAccounts.length === 0) {
          await supabase
            .from("user_instagram_accounts")
            .update({ is_default: true })
            .eq("id", accountId)
        }

        toast.success("Instagram account verified!")
        onVerified()
        onClose()
      } else {
        setVerifyError(data.error || "Verification failed. Please try again.")
      }
    } catch {
      setVerifyError("Network error. Please check your connection and try again.")
    } finally {
      setVerifying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const isExpired = timeLeft <= 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[500px] w-[95%] bg-rippl-black-2 text-white border border-rippl-black-3 p-0 flex flex-col max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-rippl-black-3">
          <DialogTitle className="text-2xl font-extrabold text-white text-center flex items-center justify-center gap-3">
            <Instagram className="w-6 h-6 text-pink-500" />
            Connect Instagram Account
          </DialogTitle>
        </DialogHeader>

        {step === "enter-url" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <p className="text-sm font-medium text-rippl-gray">
                Enter your Instagram profile link to verify account ownership.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90">Profile Link</label>
                <Input
                  placeholder="https://www.instagram.com/yourusername"
                  value={profileUrl}
                  onChange={(e) => {
                    setProfileUrl(e.target.value)
                    setUrlError("")
                  }}
                  className={cn(
                    "h-11 bg-rippl-black-3 border-rippl-black-3 rounded-xl text-white placeholder:text-rippl-gray/50 focus-visible:ring-rippl-violet focus-visible:border-rippl-violet transition-all",
                    urlError && "border-red-400 focus-visible:ring-red-400"
                  )}
                />
                {urlError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {urlError}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-rippl-black-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11 border border-rippl-black-3 text-white hover:bg-rippl-black-3 bg-rippl-black-2 rounded-xl font-bold transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartVerification}
                disabled={!profileUrl.trim()}
                className="flex-1 h-11 bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl font-bold shadow-lg shadow-rippl-violet/25 transition-all w-full"
              >
                Start Verification
              </Button>
            </div>
          </>
        )}

        {step === "verify-code" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-white mb-1">
                  Verify @{username}
                </h3>
                <p className="text-sm font-medium text-rippl-gray">
                  Follow these steps to verify your account:
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rippl-violet text-white text-sm font-bold">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">Go to your Instagram profile</p>
                  <p className="text-xs font-medium text-rippl-gray mt-1">Open the Instagram app or website and edit your bio.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rippl-violet text-white text-sm font-bold">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm mb-3">Add this verification code to your bio:</p>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl bg-rippl-violet/10 border border-rippl-violet/20 px-4 py-3 font-mono text-lg tracking-wider text-white font-bold text-center">
                      {code}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      className={cn(
                        "shrink-0 h-12 w-12 rounded-xl transition-all",
                        copied ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" : "border-rippl-black-3 bg-rippl-black-3 text-white hover:bg-rippl-black-2 hover:border-rippl-violet"
                      )}
                    >
                      {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rippl-violet text-white text-sm font-bold">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">Click verify below</p>
                  <p className="text-xs font-medium text-rippl-gray mt-1">
                    We&apos;ll check your bio for the code. You can remove it after verification.
                  </p>
                </div>
              </div>

              <div className={cn(
                "p-4 rounded-xl text-xs flex items-center gap-3 font-bold",
                isExpired
                  ? "bg-red-500/10 border border-red-500/20 text-red-500"
                  : "bg-amber-500/10 border border-amber-500/20 text-amber-500"
              )}>
                <AlertCircle className="w-5 h-5 shrink-0" />
                {isExpired ? (
                  <span>Code expired. Please go back and start again.</span>
                ) : (
                  <span>
                    Code expires in <strong>{formatTime(timeLeft)}</strong>. Add it to your bio and click verify before it expires.
                  </span>
                )}
              </div>

              {verifyError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-bold flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{verifyError}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-rippl-black-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetState()
                }}
                className="h-11 px-4 border border-rippl-black-3 text-white hover:bg-rippl-black-3 bg-rippl-black-2 rounded-xl font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleVerify}
                disabled={verifying || isExpired}
                className="flex-1 h-11 bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl font-bold shadow-lg shadow-rippl-violet/25 transition-all"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking bio...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    I&apos;ve added the code, verify now
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
