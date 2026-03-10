"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Loader2, ExternalLink, Link, Wallet } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface ApprovedSubmission {
  id: string
  campaign_id: string
  content_link: string
  platform: string
  view_count: number
  earnings: number
  submitted_at: string
  reviewed_at: string | null
  campaign?: { title: string }
}

interface PayoutRequest {
  id: string
  amount: number
  status: "pending" | "processing" | "paid" | "rejected"
  requested_at: string
  processed_at: string | null
  transaction_ref: string | null
  admin_note: string | null
}

export default function EarningsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<ApprovedSubmission[]>([])
  const [availableBalance, setAvailableBalance] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)
  const [pendingWithdrawal, setPendingWithdrawal] = useState(0)
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([])
  const [payoutDetails, setPayoutDetails] = useState<{ upiId: string | null }>({ upiId: null })
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState<string>("")

  const loadWallet = async (userId: string) => {
    try {
      const [balanceRes, historyRes, detailsRes] = await Promise.all([
        fetch("/api/wallet/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
        fetch("/api/wallet/payout-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
        fetch(`/api/wallet/payout-details?userId=${encodeURIComponent(userId)}`),
      ])

      const balanceData = await balanceRes.json()
      if (balanceRes.ok && !balanceData.error) {
        setAvailableBalance(balanceData.availableBalance ?? 0)
        setTotalEarned(balanceData.totalEarned ?? 0)
        setTotalPaid(balanceData.totalPaid ?? 0)
        setPendingWithdrawal(balanceData.pendingWithdrawal ?? 0)
      }

      const historyData = await historyRes.json()
      if (historyRes.ok && !historyData.error) {
        setPayoutHistory(
          (historyData.history || []) as PayoutRequest[],
        )
      }

      const detailsData = await detailsRes.json()
      if (detailsRes.ok && !detailsData.error) {
        const defaultDetail = detailsData.defaultDetail as { upi_id?: string } | null
        setPayoutDetails({ upiId: defaultDetail?.upi_id ?? null })
      }
    } catch (err) {
      console.error(err)
      toast.error("Could not load wallet info.")
    }
  }

  useEffect(() => {
    if (!user?.id) {
      setSubmissions([])
      setAvailableBalance(0)
      setTotalEarned(0)
      setTotalPaid(0)
      setPendingWithdrawal(0)
      setPayoutHistory([])
      setPayoutDetails({ upiId: null })
      setLoading(false)
      return
    }
    async function load() {
      setLoading(true)

      const { data, error } = await supabase
        .from("submissions")
        .select("id, campaign_id, content_link, platform, view_count, earnings, submitted_at, reviewed_at")
        .eq("user_id", user?.id ?? "")
        .eq("status", "approved")
        .order("reviewed_at", { ascending: false })

      if (error) {
        toast.error(error.message)
        setSubmissions([])
      } else {
        const rows = (data || []) as ApprovedSubmission[]
        if (rows.length > 0) {
          const campaignIds = [...new Set(rows.map((r) => r.campaign_id))]
          const { data: campaigns } = await supabase
            .from("campaigns")
            .select("id, title")
            .in("id", campaignIds)
          const campaignMap = new Map((campaigns || []).map((c) => [c.id, c]))
          rows.forEach((r) => {
            r.campaign = campaignMap.get(r.campaign_id) as { title: string } | undefined
          })
        }
        setSubmissions(data ? (data as ApprovedSubmission[]) : [])
      }

      if (user?.id) {
        await loadWallet(user.id)
      }
      setLoading(false)
    }
    void load()
  }, [user?.id])

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold text-heading-text mb-4">Earnings</h1>
        <p className="text-muted-label mt-1 mb-6">Balance and payout history</p>
        <div className="flex items-center gap-2 py-12 text-muted-label">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading earnings...</span>
        </div>
      </>
    )
  }

  const hasEarnings = submissions.length > 0
  const canRequestPayout = availableBalance >= 2000 && !!payoutDetails.upiId

  const handleSavePayoutDetails = async () => {
    if (!user?.id) return
    // eslint-disable-next-line no-alert
    const upi = window.prompt("Enter your UPI ID (e.g. name@upi)", payoutDetails.upiId ?? "") ?? ""
    const trimmed = upi.trim()
    if (!trimmed) return
    try {
      const res = await fetch("/api/wallet/payout-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, upiId: trimmed }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not save payout details.")
        return
      }
      setPayoutDetails({ upiId: data.detail?.upi_id ?? trimmed })
      toast.success("Payout details saved.")
    } catch (err) {
      console.error(err)
      toast.error("Could not save payout details.")
    }
  }

  const handleRequestPayout = async () => {
    if (!user?.id) return
    const parsedAmount = Number(payoutAmount || availableBalance)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid amount.")
      return
    }
    setRequesting(true)
    try {
      const res = await fetch("/api/wallet/request-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount: parsedAmount }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not create payout request.")
        return
      }
      toast.success("Payout request created.")
      setPayoutAmount("")
      await loadWallet(user.id)
    } catch (err) {
      console.error(err)
      toast.error("Could not create payout request.")
    } finally {
      setRequesting(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-heading-text mb-4">Wallet & Earnings</h1>
      <p className="text-muted-label mt-1 mb-6">Track your earnings, balance, and payout requests.</p>

      {!hasEarnings ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-section-bg mb-4">
            <DollarSign className="w-12 h-12 text-muted-label" />
          </div>
          <h2 className="text-xl font-semibold text-heading-text mb-2">No earnings yet</h2>
          <p className="text-muted-label max-w-sm mb-6">
            Earn from approved submissions. Views are tracked automatically and earnings update every few hours.
          </p>
          <Button
            variant="outline"
            className="border-border text-body-text hover:bg-section-bg"
            onClick={() => router.push("/dashboard/explore")}
          >
            Explore campaigns
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wallet summary */}
          <Card className="bg-main-bg border-border shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-turquoise-accent/10 flex items-center justify-center">
                    <Wallet className="w-7 h-7 text-turquoise-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-label font-medium">Available balance</p>
                    <p className="text-3xl font-bold text-heading-text">
                      ₹{availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-label mt-1">
                      Total earned: ₹{totalEarned.toLocaleString("en-IN", { maximumFractionDigits: 2 })} · Paid out: ₹
                      {totalPaid.toLocaleString("en-IN", { maximumFractionDigits: 2 })} · Pending payout: ₹
                      {pendingWithdrawal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-label">
                      Payout UPI:{" "}
                      {payoutDetails.upiId ? (
                        <span className="font-medium text-heading-text">{payoutDetails.upiId}</span>
                      ) : (
                        <span className="text-red-500 font-medium">Not set</span>
                      )}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-border text-body-text"
                      onClick={handleSavePayoutDetails}
                    >
                      {payoutDetails.upiId ? "Edit UPI" : "Add UPI"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={2000}
                      max={availableBalance}
                      placeholder={`Min ₹2,000`}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="flex-1 h-9 rounded-lg border border-border bg-background px-2 text-sm text-heading-text outline-none focus-visible:ring-1 focus-visible:ring-vibrant-red-orange"
                    />
                    <Button
                      type="button"
                      disabled={!canRequestPayout || requesting}
                      onClick={handleRequestPayout}
                      className="shrink-0 bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 rounded-lg font-medium h-9 px-3"
                    >
                      {requesting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        "Request payout"
                      )}
                    </Button>
                  </div>
                  {!payoutDetails.upiId && (
                    <p className="text-xs text-red-500">
                      Add your UPI ID to request payouts. Minimum withdrawal is ₹2,000.
                    </p>
                  )}
                  {payoutDetails.upiId && availableBalance < 2000 && (
                    <p className="text-xs text-muted-label">
                      You need at least ₹2,000 available balance to request a payout.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approved submissions list */}
          <div>
            <h2 className="text-lg font-semibold text-heading-text mb-3">Earnings from approved content</h2>
            <div className="space-y-3">
              {submissions.map((s) => (
                <Card key={s.id} className="bg-main-bg border-border shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-label mb-1">{s.campaign?.title ?? "Campaign"}</p>
                        <a
                          href={s.content_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body-text hover:text-turquoise-accent font-medium flex items-center gap-2 truncate"
                        >
                          <Link className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{s.content_link}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                        <p className="text-xs text-muted-label mt-2">
                          Approved {s.reviewed_at ? new Date(s.reviewed_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) : new Date(s.submitted_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-sm text-muted-label">{s.view_count.toLocaleString()} views gained</span>
                        <span className="text-lg font-semibold text-turquoise-accent">
                          ₹{Number(s.earnings).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Payout history */}
          <div>
            <h2 className="text-lg font-semibold text-heading-text mb-3">Payout history</h2>
            {payoutHistory.length === 0 ? (
              <p className="text-sm text-muted-label">No payout requests yet.</p>
            ) : (
              <div className="space-y-2">
                {payoutHistory.map((payout) => (
                  <Card key={payout.id} className="bg-main-bg border-border shadow-sm rounded-xl">
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-heading-text">
                          ₹{Number(payout.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-label mt-1">
                          Requested{" "}
                          {new Date(payout.requested_at).toLocaleDateString("en-IN", {
                            dateStyle: "medium",
                          })}
                          {payout.processed_at &&
                            ` · Processed ${new Date(payout.processed_at).toLocaleDateString("en-IN", {
                              dateStyle: "medium",
                            })}`}
                        </p>
                        {payout.admin_note && (
                          <p className="text-xs text-muted-label mt-1">Note: {payout.admin_note}</p>
                        )}
                        {payout.transaction_ref && (
                          <p className="text-xs text-muted-label mt-1">Ref: {payout.transaction_ref}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          payout.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : payout.status === "rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
