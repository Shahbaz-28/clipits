"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DollarSign, Loader2, ExternalLink, Link, Wallet, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { authFetch } from "@/lib/api-client"
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
  const [upiModalOpen, setUpiModalOpen] = useState(false)
  const [upiInput, setUpiInput] = useState("")
  const [savingUpi, setSavingUpi] = useState(false)
  const [earningsSearch, setEarningsSearch] = useState("")
  const [earningsPage, setEarningsPage] = useState(1)
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<"all" | PayoutRequest["status"]>("all")
  const [payoutSearch, setPayoutSearch] = useState("")
  const [payoutPage, setPayoutPage] = useState(1)
  const pageSize = 10

  const loadWallet = async () => {
    try {
      const [balanceRes, historyRes, detailsRes] = await Promise.all([
        authFetch("/api/wallet/balance", { method: "POST" }),
        authFetch("/api/wallet/payout-history", { method: "POST" }),
        authFetch("/api/wallet/payout-details"),
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
        setUpiInput(defaultDetail?.upi_id ?? "")
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
        await loadWallet()
      }
      setLoading(false)
    }
    void load()
  }, [user?.id])

  useEffect(() => {
    setEarningsPage(1)
  }, [earningsSearch])

  useEffect(() => {
    setPayoutPage(1)
  }, [payoutStatusFilter, payoutSearch])

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

  const filteredEarnings = submissions.filter((s) => {
    const term = earningsSearch.trim().toLowerCase()
    if (!term) return true
    return s.campaign?.title?.toLowerCase().includes(term) || s.content_link?.toLowerCase().includes(term)
  })
  const earningsTotalPages = Math.max(1, Math.ceil(filteredEarnings.length / pageSize))
  const earningsCurrentPage = Math.min(earningsPage, earningsTotalPages)
  const earningsStartIndex = (earningsCurrentPage - 1) * pageSize
  const paginatedEarnings = filteredEarnings.slice(earningsStartIndex, earningsStartIndex + pageSize)

  const filteredPayouts = payoutHistory.filter((p) => {
    const matchesStatus = payoutStatusFilter === "all" ? true : p.status === payoutStatusFilter
    const term = payoutSearch.trim().toLowerCase()
    if (!term) return matchesStatus
    const amountMatch = p.amount.toString().includes(term)
    const refMatch = p.transaction_ref?.toLowerCase().includes(term)
    return matchesStatus && (amountMatch || refMatch)
  })
  const payoutTotalPages = Math.max(1, Math.ceil(filteredPayouts.length / pageSize))
  const payoutCurrentPage = Math.min(payoutPage, payoutTotalPages)
  const payoutStartIndex = (payoutCurrentPage - 1) * pageSize
  const paginatedPayouts = filteredPayouts.slice(payoutStartIndex, payoutStartIndex + pageSize)

  const handleSavePayoutDetails = async () => {
    if (!user?.id) return
    const trimmed = upiInput.trim()
    if (!trimmed) {
      toast.error("Enter your UPI ID.")
      return
    }
    setSavingUpi(true)
    try {
      const res = await authFetch("/api/wallet/payout-details", {
        method: "POST",
        body: JSON.stringify({ upiId: trimmed }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not save payout details.")
        return
      }
      setPayoutDetails({ upiId: data.detail?.upi_id ?? trimmed })
      toast.success("Payout details saved.")
      setUpiModalOpen(false)
    } catch (err) {
      console.error(err)
      toast.error("Could not save payout details.")
    } finally {
      setSavingUpi(false)
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
      const res = await authFetch("/api/wallet/request-payout", {
        method: "POST",
        body: JSON.stringify({ amount: parsedAmount }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not create payout request.")
        return
      }
      toast.success("Payout request created.")
      setPayoutAmount("")
      await loadWallet()
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
                      onClick={() => setUpiModalOpen(true)}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-semibold text-heading-text">Earnings from approved content</h2>
              <div className="relative w-full sm:w-[220px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-label" />
                <Input
                  placeholder="Search by campaign or link"
                  value={earningsSearch}
                  onChange={(e) => setEarningsSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-3">
              {paginatedEarnings.map((s) => (
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
            {filteredEarnings.length > pageSize && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm text-muted-label">
                <span>
                  Showing {earningsStartIndex + 1}–{Math.min(earningsStartIndex + pageSize, filteredEarnings.length)} of {filteredEarnings.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    disabled={earningsCurrentPage === 1}
                    onClick={() => setEarningsPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    disabled={earningsCurrentPage === earningsTotalPages}
                    onClick={() => setEarningsPage((p) => Math.min(earningsTotalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Payout history */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-semibold text-heading-text">Payout history</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Select value={payoutStatusFilter} onValueChange={(v) => setPayoutStatusFilter(v as typeof payoutStatusFilter)}>
                  <SelectTrigger className="h-9 w-[140px] text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-full sm:w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-label" />
                  <Input
                    placeholder="Search amount or ref"
                    value={payoutSearch}
                    onChange={(e) => setPayoutSearch(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
            </div>
            {payoutHistory.length === 0 ? (
              <p className="text-sm text-muted-label">No payout requests yet.</p>
            ) : filteredPayouts.length === 0 ? (
              <p className="text-sm text-muted-label">No payouts match your filters.</p>
            ) : (
              <div className="space-y-2">
                {paginatedPayouts.map((payout) => (
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
            {filteredPayouts.length > pageSize && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm text-muted-label">
                <span>
                  Showing {payoutStartIndex + 1}–{Math.min(payoutStartIndex + pageSize, filteredPayouts.length)} of {filteredPayouts.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    disabled={payoutCurrentPage === 1}
                    onClick={() => setPayoutPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    disabled={payoutCurrentPage === payoutTotalPages}
                    onClick={() => setPayoutPage((p) => Math.min(payoutTotalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={upiModalOpen} onOpenChange={setUpiModalOpen}>
        <DialogContent className="sm:max-w-[420px] bg-white text-heading-text border border-gray-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-heading-text">
              {payoutDetails.upiId ? "Update UPI ID" : "Add UPI ID"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="upiId" className="text-sm font-medium text-heading-text">
                UPI ID
              </Label>
              <Input
                id="upiId"
                placeholder="name@upi"
                value={upiInput}
                onChange={(e) => setUpiInput(e.target.value)}
              />
              <p className="text-xs text-muted-label">This will be used for withdrawals.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-200"
                onClick={() => setUpiModalOpen(false)}
                disabled={savingUpi}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90"
                onClick={handleSavePayoutDetails}
                disabled={savingUpi}
              >
                {savingUpi ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
