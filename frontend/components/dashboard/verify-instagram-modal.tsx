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

    const { error } = await supabase
      .from("users")
      .update({ instagram_verification_code: newCode })
      .eq("id", user.id)

    if (error) {
      toast.error("Could not save verification code. Please try again.")
      return
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
    if (!user?.id || !code) return
    if (timeLeft <= 0) {
      setVerifyError("Code has expired. Please go back and start again.")
      return
    }

    setVerifying(true)
    setVerifyError("")

    try {
      const res = await fetch("/api/instagram/verify-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, username, code }),
      })

      const data = await res.json()

      if (data.verified) {
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
      <DialogContent className="sm:max-w-[500px] w-[95%] bg-white text-heading-text border border-gray-100 p-0 flex flex-col max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-heading-text text-center flex items-center justify-center gap-2">
            <Instagram className="w-5 h-5 text-pink-500" />
            Connect Instagram Account
          </DialogTitle>
        </DialogHeader>

        {step === "enter-url" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <p className="text-sm text-muted-label">
                Enter your Instagram profile link to verify account ownership.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium text-heading-text">Profile Link</label>
                <Input
                  placeholder="https://www.instagram.com/yourusername"
                  value={profileUrl}
                  onChange={(e) => {
                    setProfileUrl(e.target.value)
                    setUrlError("")
                  }}
                  className={cn(
                    "h-11 bg-gray-50 border-gray-200 rounded-lg text-heading-text placeholder:text-muted-label",
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

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-10 border border-gray-200 text-heading-text hover:bg-gray-50 bg-white rounded-lg font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartVerification}
                disabled={!profileUrl.trim()}
                className="flex-1 h-10 bg-[#FF4B4B] text-white hover:bg-[#FF4B4B]/90 rounded-lg font-semibold shadow-lg shadow-[#FF4B4B]/25"
              >
                Start Verification
              </Button>
            </div>
          </>
        )}

        {step === "verify-code" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <h3 className="font-semibold text-heading-text text-base mb-1">
                  Verify @{username}
                </h3>
                <p className="text-sm text-muted-label">
                  Follow these steps to verify your account:
                </p>
              </div>

              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF4B4B] text-white text-xs font-bold">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-heading-text text-sm">Go to your Instagram profile</p>
                  <p className="text-xs text-muted-label mt-0.5">Open the Instagram app or website and edit your bio.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF4B4B] text-white text-xs font-bold">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-heading-text text-sm mb-2">Add this verification code to your bio:</p>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl bg-red-50 border border-red-200 px-4 py-3 font-mono text-lg tracking-wider text-[#FF4B4B] font-bold text-center">
                      {code}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      className={cn(
                        "shrink-0 h-11 w-11 rounded-lg",
                        copied ? "text-emerald-600 border-emerald-300 bg-emerald-50" : "border-gray-200"
                      )}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF4B4B] text-white text-xs font-bold">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-heading-text text-sm">Click verify below</p>
                  <p className="text-xs text-muted-label mt-0.5">
                    We&apos;ll check your bio for the code. You can remove it after verification.
                  </p>
                </div>
              </div>

              {/* Timer */}
              <div className={cn(
                "p-3 rounded-xl text-xs flex items-center gap-2",
                isExpired
                  ? "bg-red-50 border border-red-200 text-red-600"
                  : "bg-amber-50 border border-amber-200 text-amber-700"
              )}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                {isExpired ? (
                  <span>Code expired. Please go back and start again.</span>
                ) : (
                  <span>
                    Code expires in <strong>{formatTime(timeLeft)}</strong>. Add it to your bio and click verify before it expires.
                  </span>
                )}
              </div>

              {/* Error */}
              {verifyError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{verifyError}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetState()
                }}
                className="h-10 px-4 border border-gray-200 text-heading-text hover:bg-gray-50 bg-white rounded-lg font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleVerify}
                disabled={verifying || isExpired}
                className="flex-1 h-10 bg-[#FF4B4B] text-white hover:bg-[#FF4B4B]/90 rounded-lg font-semibold shadow-lg shadow-[#FF4B4B]/25"
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
