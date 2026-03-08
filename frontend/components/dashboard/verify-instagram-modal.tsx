"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, ExternalLink, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const CODE_LENGTH = 6
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateCode(): string {
  let code = ""
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

interface VerifyInstagramModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
}

export function VerifyInstagramModal({ isOpen, onClose, onVerified }: VerifyInstagramModalProps) {
  const { user } = useAuth()
  const [code, setCode] = useState<string>("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen || !user?.id) return
    setUsername("")
    setCopied(false)
    setVerifying(false)
    const loadOrGenerate = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("users")
        .select("instagram_verification_code")
        .eq("id", user.id)
        .single()
      const existing = (data as { instagram_verification_code?: string } | null)?.instagram_verification_code
      if (existing && existing.length === CODE_LENGTH) {
        setCode(existing)
      } else {
        const newCode = generateCode()
        setCode(newCode)
        await supabase
          .from("users")
          .update({ instagram_verification_code: newCode })
          .eq("id", user.id)
      }
      setLoading(false)
    }
    loadOrGenerate()
  }, [isOpen, user?.id])

  const handleCopy = async () => {
    if (!code) return
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
    if (!user?.id) return
    setVerifying(true)
    const { error } = await supabase
      .from("users")
      .update({
        instagram_verified_at: new Date().toISOString(),
        instagram_username: username.trim() || null,
        instagram_verification_code: null,
      })
      .eq("id", user.id)
    setVerifying(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Instagram account verified")
    onVerified()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] w-[95%] bg-main-bg text-body-text border-border p-6 rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-heading-text text-xl font-bold">
            Verify account
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-label mb-6">
          A verified Instagram account is required when performing actions such as claiming Content Rewards on ClipIt.
        </p>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-section-bg border border-border text-sm font-semibold text-heading-text">
              1
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-heading-text mb-1">Copy this verification code</p>
              {loading ? (
                <div className="h-10 rounded-md bg-section-bg animate-pulse" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border border-border bg-section-bg px-3 py-2 font-mono text-lg tracking-wider text-body-text">
                    {code}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    disabled={!code}
                    className={cn(
                      "shrink-0 border-border",
                      copied && "text-turquoise-accent border-turquoise-accent"
                    )}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-section-bg border border-border text-sm font-semibold text-heading-text">
              2
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-heading-text mb-1">Go to your Instagram profile</p>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-turquoise-accent hover:underline inline-flex items-center gap-1 text-sm"
              >
                instagram.com
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-sm text-muted-label mt-1">Navigate to your bio or description settings.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-section-bg border border-border text-sm font-semibold text-heading-text">
              3
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-heading-text mb-1">Add the verification code</p>
              <p className="text-sm text-muted-label">
                To verify ownership of your account you must include the 6-character code within your profile&apos;s bio or description temporarily.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-section-bg border border-border text-sm font-semibold text-heading-text">
              4
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <p className="font-medium text-heading-text">Verify account</p>
              <p className="text-sm text-muted-label">
                Enter your Instagram username (optional) and click Verify once you&apos;ve added the code to your profile.
              </p>
              <Input
                placeholder="Instagram username (e.g. thelawace)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-section-bg border-border text-body-text placeholder:text-muted-label rounded-md"
              />
              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full sm:w-auto bg-turquoise-accent hover:bg-turquoise-accent/90 text-white"
              >
                {verifying ? (
                  <>
                    <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-label mt-4 pt-4 border-t border-border">
          After verification, you&apos;ll be able to remove the code from your profile.
        </p>
      </DialogContent>
    </Dialog>
  )
}
