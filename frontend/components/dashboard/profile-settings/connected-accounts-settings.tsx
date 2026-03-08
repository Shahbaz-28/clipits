"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Instagram, Link2, Unlink } from "lucide-react"
import { toast } from "sonner"
import { VerifyInstagramModal } from "../verify-instagram-modal"

interface InstagramStatus {
  instagram_verified_at: string | null
  instagram_username: string | null
}

/** Show only the username (e.g. "thelawace"), not a full URL */
function getDisplayUsername(value: string | null): string {
  if (!value?.trim()) return "Instagram"
  const trimmed = value.trim()
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    if (url.hostname.includes("instagram.com")) {
      const path = url.pathname.replace(/^\/+|\/+$/g, "")
      const username = path.split("/")[0]
      if (username) return username
    }
  } catch {
    // not a URL
  }
  return trimmed
}

export function ConnectedAccountsSettings() {
  const { user } = useAuth()
  const [status, setStatus] = useState<InstagramStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [unlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const fetchStatus = async () => {
    if (!user?.id) return
    setLoading(true)
    const { data, error } = await supabase
      .from("users")
      .select("instagram_verified_at, instagram_username")
      .eq("id", user.id)
      .single()
    if (!error && data) {
      setStatus({
        instagram_verified_at: (data as InstagramStatus).instagram_verified_at ?? null,
        instagram_username: (data as InstagramStatus).instagram_username ?? null,
      })
    } else {
      setStatus({ instagram_verified_at: null, instagram_username: null })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
  }, [user?.id])

  const handleDisconnect = async () => {
    if (!user?.id) return
    setDisconnecting(true)
    const { error } = await supabase
      .from("users")
      .update({
        instagram_verified_at: null,
        instagram_username: null,
        instagram_verification_code: null,
      })
      .eq("id", user.id)
    setDisconnecting(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Instagram disconnected")
    setStatus({ instagram_verified_at: null, instagram_username: null })
    setUnlinkConfirmOpen(false)
  }

  const isVerified = status?.instagram_verified_at != null
  const connectedDate = status?.instagram_verified_at
    ? new Date(status.instagram_verified_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null
  const displayUsername = getDisplayUsername(status?.instagram_username ?? null) || "Instagram"

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-heading-text">Connected accounts</h2>

      {loading ? (
        <Card className="bg-main-bg rounded-lg border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="h-20 rounded-md bg-section-bg animate-pulse" />
          </CardContent>
        </Card>
      ) : isVerified ? (
        <Card className="bg-main-bg rounded-lg border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-section-bg border border-border">
                  <Instagram className="w-6 h-6 text-heading-text" />
                </div>
                <div>
                  <p className="font-semibold text-heading-text">{displayUsername}</p>
                  <p className="text-sm text-muted-label">
                    Connected {connectedDate}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={disconnecting}
                onClick={() => setUnlinkConfirmOpen(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                title="Disconnect Instagram"
              >
                <Unlink className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isVerified && (
        <AlertDialog open={unlinkConfirmOpen} onOpenChange={setUnlinkConfirmOpen}>
          <AlertDialogContent className="bg-main-bg border-border text-body-text rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-heading-text">Confirm Account Unlink</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unlink <span className="font-semibold text-body-text">@{displayUsername}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="border-border text-body-text hover:bg-section-bg">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDisconnect()
                }}
                disabled={disconnecting}
                className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
              >
                {disconnecting ? "Unlinking..." : "Unlink"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {!loading && !isVerified && (
        <>
          <Card className="bg-main-bg rounded-lg border border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-body-text mb-4">
                Connect your Instagram account to verify ownership. You&apos;ll add a verification code to your Instagram bio temporarily.
              </p>
              <Button
                onClick={() => setVerifyModalOpen(true)}
                className="bg-turquoise-accent hover:bg-turquoise-accent/90 text-white"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Connect Instagram
              </Button>
            </CardContent>
          </Card>
          <VerifyInstagramModal
            isOpen={verifyModalOpen}
            onClose={() => setVerifyModalOpen(false)}
            onVerified={fetchStatus}
          />
        </>
      )}
    </div>
  )
}
