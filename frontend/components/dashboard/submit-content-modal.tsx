"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Link, Info, Instagram } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { authFetch } from "@/lib/api-client"

interface IgAccount {
  id: string
  username: string
  verified_at: string | null
  is_default: boolean
}

interface SubmitContentModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  onSuccess?: () => void
}

export function SubmitContentModal({ isOpen, onClose, campaignId, onSuccess }: SubmitContentModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [postLink, setPostLink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [igAccounts, setIgAccounts] = useState<IgAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [loadingAccounts, setLoadingAccounts] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setPostLink("")
    setError(null)
    setSelectedAccountId("")

    const fetchIgAccounts = async () => {
      if (!user?.id) {
        setIgAccounts([])
        setLoadingAccounts(false)
        return
      }
      setLoadingAccounts(true)
      const { data, error: fetchErr } = await supabase
        .from("user_instagram_accounts")
        .select("id, username, verified_at, is_default")
        .eq("user_id", user.id)
        .not("verified_at", "is", null)
        .order("is_default", { ascending: false })

      if (fetchErr || !data) {
        setIgAccounts([])
      } else {
        const accounts = data as IgAccount[]
        setIgAccounts(accounts)
        const defaultAcc = accounts.find((a) => a.is_default) || accounts[0]
        if (defaultAcc) setSelectedAccountId(defaultAcc.id)
      }
      setLoadingAccounts(false)
    }

    void fetchIgAccounts()
  }, [isOpen, user?.id])

  const normalizeAndValidateUrl = (s: string): { ok: boolean; url: string } => {
    const trimmed = s.trim()
    if (!trimmed) return { ok: false, url: "" }
    let url = trimmed
    if (!/^https?:\/\//i.test(trimmed)) {
      url = `https://${trimmed}`
    }
    try {
      new URL(url)
      return { ok: true, url }
    } catch {
      return { ok: false, url: trimmed }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const rawLink = postLink.trim()
    if (!rawLink) {
      setError("Provide link is required.")
      return
    }
    const { ok, url: link } = normalizeAndValidateUrl(rawLink)
    if (!ok) {
      setError("Please enter a valid link (e.g. https://www.instagram.com/reel/...).")
      return
    }
    if (igAccounts.length === 0) {
      const msg =
        "You must verify at least one Instagram account in Profile \u2192 Connected accounts before submitting content."
      setError(msg)
      toast.error(msg)
      return
    }
    if (!selectedAccountId) {
      setError("Please select which Instagram account this reel belongs to.")
      return
    }
    if (!user?.id) {
      setError("You must be signed in to submit.")
      toast.error("You must be signed in to submit.")
      return
    }
    if (!campaignId) {
      setError("Campaign is missing. Please open this from a joined campaign.")
      toast.error("Campaign is missing.")
      return
    }

    setIsSubmitting(true)
    try {
      const ownerRes = await authFetch("/api/instagram/validate-reel-owner", {
        method: "POST",
        body: JSON.stringify({ reelUrl: link, accountId: selectedAccountId }),
      })
      const ownerData = await ownerRes.json()
      if (!ownerData.ok) {
        const msg =
          ownerData.error ||
          "This reel does not appear to belong to your selected Instagram account. Please double-check the link."
        setError(msg)
        toast.error(msg)
        setIsSubmitting(false)
        return
      }

      const { error: insertError } = await supabase.from("submissions").insert({
        campaign_id: campaignId,
        user_id: user.id,
        content_link: link,
        platform: "instagram",
        status: "pending",
        instagram_account_id: selectedAccountId,
      })
      if (insertError) {
        const msg =
          insertError.message?.includes("row-level security") || insertError.message?.includes("policy")
            ? "You can only submit after joining this campaign. Make sure you joined from Explore first."
            : insertError.message
        setError(msg)
        toast.error(msg)
        return
      }
      toast.success("Content submitted for review. The creator will review it soon.")
      onSuccess?.()
      onClose()
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Something went wrong."
      const isNetwork =
        raw.includes("fetch") ||
        raw.includes("Network") ||
        raw.includes("timeout") ||
        raw.includes("Failed to load")
      const msg = isNetwork
        ? "Could not reach the server. Check your internet, and that your Supabase project is active (not paused) in the Supabase dashboard."
        : raw
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedAccount = igAccounts.find((a) => a.id === selectedAccountId)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] w-[95%] bg-white text-heading-text border border-gray-100 p-0 flex flex-col max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-heading-text">
            Create Submission
          </DialogTitle>
        </DialogHeader>

        {/* Info banner */}
        <div className="mx-6 mt-4 flex gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs">
            Only views after you submit count towards payout. Submit as soon as you post to get paid for all views.
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
            {error ===
            "You must verify at least one Instagram account in Profile \u2192 Connected accounts before submitting content." ? (
              <span>
                You must verify at least one Instagram account in{" "}
                <button
                  type="button"
                  className="underline font-semibold"
                  onClick={() => {
                    onClose()
                    router.push("/dashboard/profile/connected-accounts")
                  }}
                >
                  Profile &rarr; Connected accounts
                </button>{" "}
                before submitting content.
              </span>
            ) : (
              error
            )}
          </div>
        )}

        <form id="submit-content-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Instagram account selector */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-heading-text flex items-center gap-2">
              <Instagram className="w-3.5 h-3.5 text-pink-500" />
              Instagram Account <span className="text-red-500">*</span>
            </Label>
            {loadingAccounts ? (
              <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            ) : igAccounts.length === 0 ? (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                No verified Instagram accounts.{" "}
                <button
                  type="button"
                  className="underline font-semibold"
                  onClick={() => {
                    onClose()
                    router.push("/dashboard/profile/connected-accounts")
                  }}
                >
                  Connect one now
                </button>
              </div>
            ) : igAccounts.length === 1 ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-heading-text">
                <Instagram className="w-4 h-4 text-pink-500" />
                @{igAccounts[0].username}
              </div>
            ) : (
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="h-10 bg-gray-50 border-gray-200 rounded-lg text-heading-text">
                  <SelectValue placeholder="Select account">
                    {selectedAccount ? `@${selectedAccount.username}` : "Select account"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {igAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      @{acc.username} {acc.is_default ? "(default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Post link */}
          <div className="space-y-1.5">
            <Label htmlFor="postLink" className="text-sm font-medium text-heading-text flex items-center gap-2">
              <Link className="w-3.5 h-3.5 text-muted-label" />
              Post Link <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postLink"
              type="text"
              inputMode="url"
              placeholder="https://www.instagram.com/reel/..."
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              className={cn(
                "h-10 w-full bg-gray-50 border border-gray-200 text-heading-text placeholder:text-muted-label rounded-lg focus:border-vibrant-red-orange focus:ring-1 focus:ring-vibrant-red-orange",
                error && !postLink.trim() && "border-red-400"
              )}
            />
          </div>

          {/* Media upload removed: we only require the reel link now */}
        </form>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-10 border border-gray-200 text-heading-text hover:bg-gray-50 bg-white rounded-lg font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="submit-content-form"
            disabled={isSubmitting}
            className="flex-1 h-10 bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 rounded-lg font-semibold shadow-lg shadow-vibrant-red-orange/25"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
