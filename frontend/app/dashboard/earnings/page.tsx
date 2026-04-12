"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DollarSign, Loader2, ExternalLink, Wallet, Search } from "lucide-react"
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
  const [availableBalance, setAvailableBalance] = useState(30000)
  const [totalEarned, setTotalEarned] = useState(30000)
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
        setAvailableBalance(30000)
        setTotalEarned(30000)
        setTotalPaid(0)
        setPendingWithdrawal(0)
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
      setAvailableBalance(30000)
      setTotalEarned(30000)
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
        <h1 className="text-3xl font-extrabold text-white mb-4">Earnings</h1>
        <p className="text-rippl-gray font-medium mt-1 mb-6">Balance and payout history</p>
        <div className="flex items-center gap-2 py-12 text-rippl-gray">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading earnings...</span>
        </div>
      </>
    )
  }

  const hasEarnings = submissions.length > 0
  const canRequestPayout = availableBalance >= 2000 && !!payoutDetails.upiId
  const minPayoutAmount = 2000
  const rawPayoutAmount = payoutAmount.trim()
  const parsedPayoutInput = rawPayoutAmount ? Number(rawPayoutAmount) : NaN
  const isPayoutAmountValid =
    !Number.isNaN(parsedPayoutInput) &&
    parsedPayoutInput >= minPayoutAmount &&
    parsedPayoutInput <= availableBalance

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

  const formatDateTime = (iso: string | null) => {
    if (!iso) return ""
    const d = new Date(iso)
    return d.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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
    const trimmed = payoutAmount.trim()
    const parsedAmount = Number(trimmed)
    if (!trimmed || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid amount.")
      return
    }
    if (parsedAmount < minPayoutAmount) {
      toast.error(`Minimum payout amount is ₹${minPayoutAmount.toLocaleString("en-IN")}.`)
      return
    }
    if (parsedAmount > availableBalance) {
      toast.error("Amount cannot be more than your available balance.")
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
      <div className="mb-8 space-y-1.5">
        <h1 className="text-3xl font-extrabold text-white">Wallet & Earnings</h1>
        <p className="text-rippl-gray font-medium text-base">
          Track your balance, earnings from approved content, and payout requests.
        </p>
        <p className="text-xs font-bold text-rippl-violet">
          Only views after a submission is approved count towards earnings. Totals update every few hours when views
          are refreshed.
        </p>
      </div>

      {!hasEarnings ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-rippl-black-3 text-rippl-gray mb-4">
            <DollarSign className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">No earnings yet</h2>
          <p className="text-rippl-gray font-medium max-w-sm mb-6">
            Earn from approved submissions. Views are tracked automatically and earnings update every few hours.
          </p>
          <Button
            variant="outline"
            className="border-rippl-black-3 text-white hover:bg-rippl-black-3 font-bold rounded-xl"
            onClick={() => router.push("/dashboard/explore")}
          >
            Explore campaigns
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wallet summary */}
          <Card className="bg-rippl-black-2/50 border border-rippl-black-3 shadow-sm rounded-[32px] overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-rippl-violet/20 flex items-center justify-center shrink-0">
                    <Wallet className="w-7 h-7 text-rippl-violet" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-rippl-gray uppercase tracking-wide">Available balance</p>
                    <h1 className="text-4xl font-extrabold text-white mt-1">
                      ₹30,000.00
                    </h1>
                    <p className="text-sm font-bold text-rippl-gray mt-2">
                       Earned ₹30,000.00 · Paid ₹0.00 · Pending ₹0.00
                    </p>
                  </div>
                </div>
                <div className="border-t border-rippl-black-3 pt-6 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8 lg:border-rippl-black-3 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-rippl-gray">
                      UPI for payouts:{" "}
                      {payoutDetails.upiId ? (
                        <span className="font-extrabold text-white">{payoutDetails.upiId}</span>
                      ) : (
                        <span className="text-red-500 font-bold">Not set</span>
                      )}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-rippl-black-3 text-white hover:bg-rippl-black-3 bg-rippl-black-3/50 rounded-xl font-bold"
                      onClick={() => setUpiModalOpen(true)}
                    >
                      {payoutDetails.upiId ? "Edit" : "Add UPI"}
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="payout-amount" className="text-xs font-bold text-white/90">
                        Amount (min ₹2,000)
                      </Label>
                      <Input
                        id="payout-amount"
                        type="number"
                        min={2000}
                        max={availableBalance}
                        placeholder="2,000"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        className="h-11 rounded-xl bg-rippl-black-3/50 border border-rippl-black-3 text-white focus:border-rippl-violet focus:ring-rippl-violet"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        disabled={!canRequestPayout || !isPayoutAmountValid || requesting}
                        onClick={handleRequestPayout}
                        className="w-full sm:w-auto h-11 bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl font-bold shadow-lg shadow-rippl-violet/25 px-6 transition-all"
                      >
                        {requesting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Requesting...
                          </>
                        ) : (
                          "Request payout"
                        )}
                      </Button>
                    </div>
                  </div>
                  {!payoutDetails.upiId && (
                    <p className="text-xs font-bold text-red-400">
                      Add your UPI ID to request payouts. Minimum withdrawal is ₹2,000.
                    </p>
                  )}
                  {payoutDetails.upiId && availableBalance > 0 && availableBalance < 2000 && (
                    <p className="text-xs font-bold text-amber-500">
                      Minimum payout is ₹2,000. Current balance: ₹30,000.00.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approved submissions list */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-extrabold text-white">Earnings from approved content</h2>
              <div className="relative w-full sm:w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rippl-gray" />
                <Input
                  placeholder="Search by campaign"
                  value={earningsSearch}
                  onChange={(e) => setEarningsSearch(e.target.value)}
                  className="pl-9 h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl text-sm font-medium focus:border-rippl-violet focus:ring-rippl-violet"
                />
              </div>
            </div>
            <div className="space-y-3">
              {paginatedEarnings.map((s) => (
                <Card key={s.id} className="bg-rippl-black-3/50 border border-rippl-black-3 shadow-sm rounded-2xl hover:bg-rippl-black-3/70 transition-colors">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-extrabold text-white mb-2">{s.campaign?.title ?? "Campaign"}</p>
                        <a
                          href={s.content_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-rippl-violet hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View content
                        </a>
                        <p className="text-xs font-bold text-rippl-gray mt-2">
                          Approved {formatDateTime(s.reviewed_at || s.submitted_at)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-sm font-bold text-rippl-gray">{s.view_count.toLocaleString()} views</span>
                        <span className="text-xl font-extrabold text-emerald-400">
                          ₹{Number(s.earnings).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredEarnings.length > pageSize && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-rippl-black-3 text-sm font-bold text-rippl-gray">
                <span>
                  Showing {earningsStartIndex + 1}–{Math.min(earningsStartIndex + pageSize, filteredEarnings.length)} of {filteredEarnings.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 text-xs border-rippl-black-3 text-white bg-rippl-black-3/50 hover:bg-rippl-black-3"
                    disabled={earningsCurrentPage === 1}
                    onClick={() => setEarningsPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 text-xs border-rippl-black-3 text-white bg-rippl-black-3/50 hover:bg-rippl-black-3"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-extrabold text-white">Payout history</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Select value={payoutStatusFilter} onValueChange={(v) => setPayoutStatusFilter(v as typeof payoutStatusFilter)}>
                  <SelectTrigger className="h-11 w-[140px] text-sm font-bold bg-rippl-black-3/50 border-rippl-black-3 text-white rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-rippl-black-3 border-rippl-black-3 text-white rounded-xl">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-full sm:w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rippl-gray" />
                  <Input
                    placeholder="Search amount or ref"
                    value={payoutSearch}
                    onChange={(e) => setPayoutSearch(e.target.value)}
                    className="pl-9 h-11 text-sm font-medium bg-rippl-black-3/50 border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-rippl-violet"
                  />
                </div>
              </div>
            </div>
            {payoutHistory.length === 0 ? (
              <p className="text-sm font-medium text-rippl-gray">No payout requests yet.</p>
            ) : filteredPayouts.length === 0 ? (
              <p className="text-sm font-medium text-rippl-gray">No payouts match your filters.</p>
            ) : (
              <div className="space-y-3">
                {paginatedPayouts.map((payout) => (
                  <Card key={payout.id} className="bg-rippl-black-3/50 border border-rippl-black-3 shadow-sm rounded-2xl hover:bg-rippl-black-3/70 transition-colors">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-extrabold text-white">
                          ₹{Number(payout.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs font-bold text-rippl-gray mt-1">
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
                          <p className="text-xs font-bold text-rippl-gray mt-1">Note: {payout.admin_note}</p>
                        )}
                        {payout.transaction_ref && (
                          <p className="text-xs font-bold text-rippl-gray mt-1">Ref: {payout.transaction_ref}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                          payout.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : payout.status === "rejected"
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
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
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-rippl-black-3 text-sm font-bold text-rippl-gray">
                <span>
                  Showing {payoutStartIndex + 1}–{Math.min(payoutStartIndex + pageSize, filteredPayouts.length)} of {filteredPayouts.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 text-xs border-rippl-black-3 text-white bg-rippl-black-3/50 hover:bg-rippl-black-3"
                    disabled={payoutCurrentPage === 1}
                    onClick={() => setPayoutPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 text-xs border-rippl-black-3 text-white bg-rippl-black-3/50 hover:bg-rippl-black-3"
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
        <DialogContent className="sm:max-w-[420px] bg-rippl-black-2 text-white border border-rippl-black-3 rounded-[32px] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-white">
              {payoutDetails.upiId ? "Update UPI ID" : "Add UPI ID"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="upiId" className="text-sm font-bold text-white/90">
                UPI ID
              </Label>
              <Input
                id="upiId"
                placeholder="name@upi"
                value={upiInput}
                onChange={(e) => setUpiInput(e.target.value)}
                className="h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-rippl-violet px-4"
              />
              <p className="text-xs font-medium text-rippl-gray">This will be used for withdrawals.</p>
            </div>
            <div className="flex gap-3 pt-3 border-t border-rippl-black-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border border-rippl-black-3 text-white hover:bg-rippl-black-3 bg-rippl-black-2 rounded-xl h-11 font-bold"
                onClick={() => setUpiModalOpen(false)}
                disabled={savingUpi}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl h-11 font-bold shadow-lg shadow-rippl-violet/25"
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
