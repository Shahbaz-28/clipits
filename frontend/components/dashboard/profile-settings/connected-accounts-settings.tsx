"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Instagram, Link2, Unlink, Star, Plus } from "lucide-react"
import { toast } from "sonner"
import { VerifyInstagramModal } from "../verify-instagram-modal"

interface IgAccount {
  id: string
  username: string
  verified_at: string | null
  is_default: boolean
  created_at: string
}

export function ConnectedAccountsSettings() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<IgAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [unlinkTarget, setUnlinkTarget] = useState<IgAccount | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  const fetchAccounts = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    const { data, error } = await supabase
      .from("user_instagram_accounts")
      .select("id, username, verified_at, is_default, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
    if (!error && data) {
      setAccounts(data as IgAccount[])
    } else {
      setAccounts([])
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleDisconnect = async () => {
    if (!unlinkTarget) return
    setDisconnecting(true)
    const { error } = await supabase
      .from("user_instagram_accounts")
      .delete()
      .eq("id", unlinkTarget.id)
    setDisconnecting(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(`@${unlinkTarget.username} disconnected`)
    setUnlinkTarget(null)
    fetchAccounts()
  }

  const handleSetDefault = async (account: IgAccount) => {
    if (!user?.id) return
    await supabase
      .from("user_instagram_accounts")
      .update({ is_default: false })
      .eq("user_id", user.id)

    await supabase
      .from("user_instagram_accounts")
      .update({ is_default: true })
      .eq("id", account.id)

    toast.success(`@${account.username} set as default`)
    fetchAccounts()
  }

  const verifiedAccounts = accounts.filter((a) => a.verified_at != null)
  const pendingAccounts = accounts.filter((a) => a.verified_at == null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-heading-text">Connected accounts</h2>
        <Button
          size="sm"
          onClick={() => setVerifyModalOpen(true)}
          className="bg-[#FF4B4B] hover:bg-[#FF4B4B]/90 text-white rounded-lg font-medium h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Account
        </Button>
      </div>

      {loading ? (
        <Card className="bg-main-bg rounded-lg border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="h-20 rounded-md bg-section-bg animate-pulse" />
          </CardContent>
        </Card>
      ) : verifiedAccounts.length === 0 && pendingAccounts.length === 0 ? (
        <Card className="bg-main-bg rounded-lg border border-border shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-3">
              <Instagram className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-body-text mb-1 font-medium">No Instagram accounts connected</p>
            <p className="text-sm text-muted-label mb-4">
              Connect your Instagram accounts to start submitting reels for campaigns.
            </p>
            <Button
              onClick={() => setVerifyModalOpen(true)}
              className="bg-[#FF4B4B] hover:bg-[#FF4B4B]/90 text-white rounded-lg"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Connect Instagram
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {verifiedAccounts.map((acc) => (
            <Card key={acc.id} className="bg-main-bg rounded-lg border border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-heading-text">@{acc.username}</p>
                        {acc.is_default && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                            <Star className="w-3 h-3" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-label">
                        Verified {new Date(acc.verified_at!).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!acc.is_default && verifiedAccounts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSetDefault(acc)}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 shrink-0"
                        title="Set as default"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={disconnecting}
                      onClick={() => setUnlinkTarget(acc)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                      title="Disconnect"
                    >
                      <Unlink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {pendingAccounts.map((acc) => (
            <Card key={acc.id} className="bg-main-bg rounded-lg border border-dashed border-amber-300 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <Instagram className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-heading-text">@{acc.username}</p>
                      <p className="text-sm text-amber-600">Pending verification</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={disconnecting}
                    onClick={() => setUnlinkTarget(acc)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                    title="Remove"
                  >
                    <Unlink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Unlink confirmation dialog */}
      <AlertDialog open={!!unlinkTarget} onOpenChange={(open) => { if (!open) setUnlinkTarget(null) }}>
        <AlertDialogContent className="bg-main-bg border-border text-body-text rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-heading-text">Disconnect Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect <span className="font-semibold text-body-text">@{unlinkTarget?.username}</span>?
              Existing submissions tied to this account won&apos;t be affected.
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
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify modal */}
      <VerifyInstagramModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onVerified={fetchAccounts}
      />
    </div>
  )
}
