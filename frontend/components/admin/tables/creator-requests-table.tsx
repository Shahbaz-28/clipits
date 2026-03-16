"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Loader2, Search, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface CreatorRequest {
  id: string
  title: string
  description: string | null
  rate_per_1k: number
  total_budget: number
  category: string | null
  type: string
  status: "pending_review" | "rejected" | "awaiting_payment"
  created_at: string
  creator: {
    first_name: string | null
    last_name: string | null
    email: string | null
  }
  end_date?: string | null
  min_payout?: number
  max_payout?: number
  flat_fee_bonus?: number
  platforms?: string[] | null
  requirements?: unknown[] | null
  assets?: unknown[] | null
  disclaimer?: string | null
  admin_approved_at?: string | null
  admin_rejected_reason?: string | null
}

const ADMIN_METRICS_REFRESH_EVENT = "admin-metrics-refresh"

export function CreatorRequestsTable() {
  const [requests, setRequests] = useState<CreatorRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectRequest, setRejectRequest] = useState<CreatorRequest | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailRequest, setDetailRequest] = useState<CreatorRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | CreatorRequest["status"]>("pending_review")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    void fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select(
          `
          id,
          title,
          description,
          rate_per_1k,
          total_budget,
          category,
          type,
          status,
          created_at,
          end_date,
          min_payout,
          max_payout,
          flat_fee_bonus,
          platforms,
          requirements,
          assets,
          disclaimer,
          admin_approved_at,
          admin_rejected_reason,
          users!campaigns_created_by_fkey (
            first_name,
            last_name,
            email
          )
        `,
        )
        .order("created_at", { ascending: false })

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading creator requests:", error.message)
        toast.error("Could not load creator requests.")
        setRequests([])
        return
      }

      const mapped: CreatorRequest[] =
        data?.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          rate_per_1k: Number(row.rate_per_1k ?? 0),
          total_budget: Number(row.total_budget ?? 0),
          category: row.category,
          type: row.type,
          status: row.status as CreatorRequest["status"],
          created_at: row.created_at,
          creator: {
            first_name: row.users?.first_name ?? null,
            last_name: row.users?.last_name ?? null,
            email: row.users?.email ?? null,
          },
          end_date: row.end_date ?? null,
          min_payout: row.min_payout != null ? Number(row.min_payout) : undefined,
          max_payout: row.max_payout != null ? Number(row.max_payout) : undefined,
          flat_fee_bonus: row.flat_fee_bonus != null ? Number(row.flat_fee_bonus) : undefined,
          platforms: Array.isArray(row.platforms) ? row.platforms : null,
          requirements: Array.isArray(row.requirements) ? row.requirements : null,
          assets: Array.isArray(row.assets) ? row.assets : null,
          disclaimer: row.disclaimer ?? null,
          admin_approved_at: row.admin_approved_at ?? null,
          admin_rejected_reason: row.admin_rejected_reason ?? null,
        })) ?? []

      setRequests(mapped)
    } finally {
      setLoading(false)
    }
  }

  const performStatusUpdate = async (
    requestId: string,
    status: "awaiting_payment" | "rejected",
    adminNote: string | null
  ) => {
    const updates: Record<string, unknown> = {
      status,
    }
    if (status === "awaiting_payment") {
      updates.admin_approved_at = new Date().toISOString()
      updates.admin_rejected_reason = null
    }
    if (status === "rejected") {
      updates.admin_rejected_reason = adminNote
    }

    const { error } = await supabase.from("campaigns").update(updates).eq("id", requestId)
    if (error) {
      toast.error(error.message)
      return false
    }
    toast.success(
      status === "awaiting_payment" ? "Campaign approved. Waiting for creator payment." : "Campaign rejected."
    )
    await fetchRequests()
    window.dispatchEvent(new CustomEvent(ADMIN_METRICS_REFRESH_EVENT))
    return true
  }

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      await performStatusUpdate(requestId, "awaiting_payment", null)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectClick = (request: CreatorRequest) => {
    setRejectRequest(request)
    setRejectReason("")
    setRejectModalOpen(true)
  }

  const handleRejectSubmit = async () => {
    if (!rejectRequest) return
    setActionLoading(rejectRequest.id)
    try {
      const note = rejectReason.trim() || null
      const ok = await performStatusUpdate(rejectRequest.id, "rejected", note)
      if (ok) {
        setRejectModalOpen(false)
        setRejectRequest(null)
        setRejectReason("")
      }
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: CreatorRequest["status"]) => {
    const variants: Record<CreatorRequest["status"], { className: string; label: string }> = {
      pending_review: { className: "bg-yellow-100 text-yellow-700", label: "Under review" },
      awaiting_payment: { className: "bg-blue-100 text-blue-700", label: "Awaiting payment" },
      rejected: { className: "bg-red-100 text-red-700", label: "Rejected" },
    }
    const v = variants[status]
    return (
      <Badge className={`${v.className} rounded-md`}>
        {v.label}
      </Badge>
    )
  }

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter
    const term = searchTerm.trim().toLowerCase()
    if (!term) return matchesStatus
    const creatorName = `${r.creator.first_name ?? ""} ${r.creator.last_name ?? ""}`.toLowerCase()
    const email = (r.creator.email ?? "").toLowerCase()
    const title = r.title.toLowerCase()
    const matchesSearch = creatorName.includes(term) || email.includes(term) || title.includes(term)
    return matchesStatus && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    setPage(1)
  }, [statusFilter, searchTerm])

  if (loading) {
    return (
      <Card className="shadow-sm border border-border rounded-xl">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-xl font-semibold text-foreground">Creator Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading requests...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card className="shadow-sm border border-border rounded-xl">
      <CardHeader className="px-6 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">Creator Requests</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="h-8 w-[150px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending_review">Pending review</SelectItem>
                  <SelectItem value="awaiting_payment">Awaiting payment</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search creator or title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-7 pr-2 text-xs w-[200px]"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground px-6 py-3">Creator Name</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Email</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Campaign Title</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Budget</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Status</TableHead>
                <TableHead className="text-muted-foreground px-6 py-3">Date Submitted</TableHead>
                <TableHead className="text-right min-w-[120px] text-muted-foreground px-6 py-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No creator requests found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium text-foreground px-6 py-3">
                      {request.creator.first_name} {request.creator.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      {request.creator.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      {request.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      ₹{request.total_budget.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      {formatDate(request.created_at)}
                    </TableCell>
                    <TableCell className="text-right px-6 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md"
                        onClick={() => {
                          setDetailRequest(request)
                          setDetailModalOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">View details</span>
                      </Button>
                      {request.status === "pending_review" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md"
                            onClick={() => handleApprove(request.id)}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                            ) : (
                              <Check className="h-4 w-4 text-emerald-500" />
                            )}
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md"
                            onClick={() => handleRejectClick(request)}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <X className="h-4 w-4 text-destructive" />
                            )}
                            <span className="sr-only">Reject</span>
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-border text-xs text-muted-foreground">
              <span>
                Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <Dialog
      open={rejectModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          setRejectModalOpen(false)
          setRejectRequest(null)
          setRejectReason("")
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px] border border-border rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Reject campaign request</DialogTitle>
        </DialogHeader>
        {rejectRequest && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Reject &quot;{rejectRequest.title}&quot; by {rejectRequest.creator.first_name}{" "}
              {rejectRequest.creator.last_name}? You can add a reason below (optional).
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="reject-reason">Reason (optional)</Label>
              <Textarea
                id="reject-reason"
                placeholder="e.g. Budget doesn't meet guidelines"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[80px] resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setRejectModalOpen(false)
                  setRejectRequest(null)
                  setRejectReason("")
                }}
                disabled={!!actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => void handleRejectSubmit()}
                disabled={!!actionLoading}
              >
                {actionLoading === rejectRequest.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting…
                  </>
                ) : (
                  "Reject"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <Dialog
      open={detailModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          setDetailModalOpen(false)
          setDetailRequest(null)
        }
      }}
    >
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] border border-border rounded-xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Campaign details</DialogTitle>
        </DialogHeader>
        {detailRequest && (
          <div className="overflow-y-auto space-y-6 pr-2">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground border-b border-border pb-1">Creator</h4>
              <dl className="grid grid-cols-1 gap-1.5 text-sm">
                <div>
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-medium">
                    {detailRequest.creator.first_name} {detailRequest.creator.last_name}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">{detailRequest.creator.email ?? "—"}</p>
                </div>
              </dl>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground border-b border-border pb-1">Campaign (what creator filled)</h4>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Title</span>
                  <p className="font-medium">{detailRequest.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Description</span>
                  <p className="font-medium whitespace-pre-wrap">{detailRequest.description ?? "—"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="font-medium">{detailRequest.type === "ugc" ? "UGC" : "Clipping"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <p className="font-medium">{detailRequest.category ?? "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">Total budget</span>
                    <p className="font-medium">₹{detailRequest.total_budget.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rate per 1K views</span>
                    <p className="font-medium">₹{Number(detailRequest.rate_per_1k).toLocaleString("en-IN")}</p>
                  </div>
                </div>
                {(detailRequest.min_payout != null || detailRequest.max_payout != null) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground">Min payout</span>
                      <p className="font-medium">₹{Number(detailRequest.min_payout ?? 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max payout</span>
                      <p className="font-medium">₹{Number(detailRequest.max_payout ?? 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                )}
                {detailRequest.flat_fee_bonus != null && detailRequest.flat_fee_bonus > 0 && (
                  <div>
                    <span className="text-muted-foreground">Flat fee bonus</span>
                    <p className="font-medium">₹{Number(detailRequest.flat_fee_bonus).toLocaleString("en-IN")}</p>
                  </div>
                )}
                {detailRequest.platforms && detailRequest.platforms.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Platforms</span>
                    <p className="font-medium">{detailRequest.platforms.join(", ")}</p>
                  </div>
                )}
                {detailRequest.requirements && detailRequest.requirements.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Requirements</span>
                    <ul className="list-disc list-inside font-medium mt-0.5">
                      {detailRequest.requirements.map((r, i) => (
                        <li key={i}>{typeof r === "string" ? r : JSON.stringify(r)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {detailRequest.assets && detailRequest.assets.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Asset links</span>
                    <ul className="list-disc list-inside font-medium mt-0.5 break-all">
                      {detailRequest.assets.map((a, i) => (
                        <li key={i}>
                          {typeof a === "string" ? (
                            <a href={a} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {a}
                            </a>
                          ) : (
                            JSON.stringify(a)
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {detailRequest.disclaimer && (
                  <div>
                    <span className="text-muted-foreground">Disclaimer</span>
                    <p className="font-medium whitespace-pre-wrap">{detailRequest.disclaimer}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium">{getStatusBadge(detailRequest.status)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted</span>
                    <p className="font-medium">{formatDate(detailRequest.created_at)}</p>
                  </div>
                </div>
                {detailRequest.end_date && (
                  <div>
                    <span className="text-muted-foreground">End date</span>
                    <p className="font-medium">{formatDate(detailRequest.end_date)}</p>
                  </div>
                )}
                {detailRequest.admin_approved_at && (
                  <div>
                    <span className="text-muted-foreground">Admin approved at</span>
                    <p className="font-medium">{formatDate(detailRequest.admin_approved_at)}</p>
                  </div>
                )}
                {detailRequest.admin_rejected_reason && (
                  <div>
                    <span className="text-muted-foreground">Rejection reason</span>
                    <p className="font-medium text-destructive whitespace-pre-wrap">{detailRequest.admin_rejected_reason}</p>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}
