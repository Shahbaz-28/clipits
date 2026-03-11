"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2, ExternalLink, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface AdminSubmissionRow {
  id: string
  campaign_id: string
  user_id: string
  content_link: string
  platform: string
  status: "pending" | "approved" | "rejected"
  view_count: number
  earnings: number
  submitted_at: string
  campaign_title?: string
  clipper_name?: string
}

export function ClipperSubmissionsTable() {
  const [submissions, setSubmissions] = useState<AdminSubmissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<"all" | AdminSubmissionRow["status"]>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const load = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("submissions")
      .select("id, campaign_id, user_id, content_link, platform, status, view_count, earnings, submitted_at")
      .order("submitted_at", { ascending: false })

    if (error) {
      toast.error(error.message)
      setSubmissions([])
      setLoading(false)
      return
    }

    const baseRows = (data || []) as AdminSubmissionRow[]

    if (baseRows.length === 0) {
      setSubmissions([])
      setLoading(false)
      return
    }

    const campaignIds = [...new Set(baseRows.map((r) => r.campaign_id))]
    const userIds = [...new Set(baseRows.map((r) => r.user_id))]

    const [{ data: campaigns }, { data: users }] = await Promise.all([
      supabase.from("campaigns").select("id, title").in("id", campaignIds),
      supabase.from("users").select("id, first_name, last_name, email").in("id", userIds),
    ])

    const campaignMap = new Map((campaigns || []).map((c) => [c.id, c.title as string]))
    const userMap = new Map(
      (users || []).map((u) => {
        const fullName =
          [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
          (u.email ? String(u.email).split("@")[0] : "Clipper")
        return [u.id, fullName]
      }),
    )

    const withMeta: AdminSubmissionRow[] = baseRows.map((r) => ({
      ...r,
      campaign_title: campaignMap.get(r.campaign_id) ?? "Campaign",
      clipper_name: userMap.get(r.user_id) ?? "Clipper",
    }))

    setSubmissions(withMeta)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const handleApprove = async (submission: AdminSubmissionRow) => {
    if (!user?.id) return
    setUpdatingId(submission.id)
    const { error } = await supabase
      .from("submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: null,
      })
      .eq("id", submission.id)

    if (error) {
      toast.error(error.message)
      setUpdatingId(null)
      return
    }

    try {
      const res = await fetch("/api/views/fetch-baseline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id, reelUrl: submission.content_link }),
      })
      const result = await res.json()
      if (result.fromApi) {
        toast.success(`Approved! Baseline views captured: ${result.views.toLocaleString()}`)
      } else {
        toast.success("Approved! View tracking will start on the next check.")
      }
    } catch {
      toast.success("Approved! View tracking will start on the next check.")
    }

    setUpdatingId(null)
    void load()
  }

  const handleReject = async (submission: AdminSubmissionRow) => {
    if (!user?.id) return
    const reason = "Not approved"
    setUpdatingId(submission.id)
    const { error } = await supabase
      .from("submissions")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: reason,
      })
      .eq("id", submission.id)

    if (error) {
      toast.error(error.message)
      setUpdatingId(null)
      return
    }

    toast.success("Submission rejected.")
    setUpdatingId(null)
    void load()
  }

  const renderStatusBadge = (status: AdminSubmissionRow["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs">Pending</Badge>
      case "approved":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs">
            Approved
          </Badge>
        )
      case "rejected":
        return <Badge className="bg-red-50 text-red-600 border border-red-200 rounded-md text-xs">Rejected</Badge>
      default:
        return null
    }
  }

  const filtered = submissions.filter((s) => {
    const matchesStatus = statusFilter === "all" ? true : s.status === statusFilter
    const term = searchTerm.trim().toLowerCase()
    if (!term) return matchesStatus
    const title = (s.campaign_title ?? "").toLowerCase()
    const clipper = (s.clipper_name ?? "").toLowerCase()
    return matchesStatus && (title.includes(term) || clipper.includes(term))
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    setPage(1)
  }, [statusFilter, searchTerm])

  return (
    <Card className="shadow-sm border border-border rounded-xl">
      <CardHeader className="px-6 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">Clipper Submissions</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="h-8 w-[150px] text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search campaign or clipper"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-7 pr-2 text-xs w-[220px]"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading submissions...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground px-6 py-3">Campaign Name</TableHead>
                  <TableHead className="text-muted-foreground px-6 py-3">Clipper Name</TableHead>
                  <TableHead className="text-muted-foreground px-6 py-3">Reel URL</TableHead>
                  <TableHead className="text-muted-foreground px-6 py-3">Status</TableHead>
                  <TableHead className="text-muted-foreground px-6 py-3">View Count</TableHead>
                  <TableHead className="text-muted-foreground px-6 py-3">Payout</TableHead>
                  <TableHead className="text-right min-w-[120px] text-muted-foreground px-6 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      No clipper submissions yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium text-foreground px-6 py-3">
                        {submission.campaign_title}
                      </TableCell>
                      <TableCell className="text-muted-foreground px-6 py-3">
                        {submission.clipper_name}
                      </TableCell>
                      <TableCell className="px-6 py-3 max-w-[220px]">
                        <a
                          href={submission.content_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs break-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {submission.content_link}
                        </a>
                      </TableCell>
                      <TableCell className="px-6 py-3">
                        {renderStatusBadge(submission.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground px-6 py-3">
                        {submission.view_count?.toLocaleString?.() ?? 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground px-6 py-3">
                        ₹
                        {Number(submission.earnings || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right px-6 py-3 space-x-2">
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 px-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={submission.status !== "pending" || updatingId === submission.id}
                          onClick={() => handleApprove(submission)}
                        >
                          {updatingId === submission.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                          <span className="sr-only">Approve</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 rounded-md border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={submission.status !== "pending" || updatingId === submission.id}
                          onClick={() => handleReject(submission)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                          <span className="sr-only">Reject</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {filtered.length > 0 && !loading && (
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
  )
}


