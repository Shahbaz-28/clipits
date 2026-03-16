"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

type AdminCampaignRow = {
  id: string
  title: string
  status: string
  total_budget: number
  created_at: string
  end_date: string | null
  total_views: number
}

export function CampaignsTable() {
  const [campaigns, setCampaigns] = useState<AdminCampaignRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | AdminCampaignRow["status"]>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)
      try {
        const [{ data: campaignRows, error: campaignsError }, { data: submissions, error: submissionsError }] =
          await Promise.all([
            supabase
              .from("campaigns")
              .select("id, title, status, total_budget, created_at, end_date")
              .order("created_at", { ascending: false }),
            supabase.from("submissions").select("campaign_id, view_count").eq("status", "approved"),
          ])

        if (campaignsError) {
          // eslint-disable-next-line no-console
          console.error("Error loading campaigns for admin:", campaignsError.message)
          setCampaigns([])
          return
        }

        const viewsByCampaign: Record<string, number> = {}
        if (!submissionsError) {
          for (const row of submissions ?? []) {
            const { campaign_id, view_count } = row as { campaign_id?: string; view_count?: number }
            if (!campaign_id) continue
            viewsByCampaign[campaign_id] = (viewsByCampaign[campaign_id] ?? 0) + Number(view_count ?? 0)
          }
        }

        const mapped: AdminCampaignRow[] =
          campaignRows?.map((c) => {
            const row = c as {
              id: string
              title: string
              status: string
              total_budget: number
              created_at: string
              end_date: string | null
            }
            return {
              ...row,
              total_budget: Number(row.total_budget ?? 0),
              total_views: viewsByCampaign[row.id] ?? 0,
            }
          }) ?? []

        setCampaigns(mapped)
      } finally {
        setLoading(false)
      }
    }

    void fetchCampaigns()
  }, [])

  const formatDate = (iso: string | null) => {
    if (!iso) return "—"
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderStatusBadge = (status: string) => {
    const map: Record<
      string,
      { label: string; className: string; icon: typeof Clock | typeof CheckCircle2 | typeof XCircle }
    > = {
      draft: {
        label: "Draft",
        className: "bg-amber-50 text-amber-600 border border-amber-200",
        icon: Clock,
      },
      pending_review: {
        label: "Under review",
        className: "bg-orange-50 text-orange-600 border border-orange-200",
        icon: Clock,
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-50 text-red-600 border border-red-200",
        icon: XCircle,
      },
      awaiting_payment: {
        label: "Awaiting payment",
        className: "bg-blue-50 text-blue-600 border border-blue-200",
        icon: Clock,
      },
      live: {
        label: "Live",
        className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
        icon: CheckCircle2,
      },
      paused: {
        label: "Paused",
        className: "bg-gray-50 text-gray-500 border border-gray-200",
        icon: Clock,
      },
      completed: {
        label: "Completed",
        className: "bg-gray-50 text-gray-500 border border-gray-200",
        icon: CheckCircle2,
      },
    }

    const def =
      map[status] ?? {
        label: status,
        className: "bg-gray-50 text-gray-500 border border-gray-200",
        icon: Clock,
      }
    const Icon = def.icon

    return (
      <Badge className={`${def.className} rounded-md inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold`}>
        <Icon className="w-3 h-3" />
        {def.label}
      </Badge>
    )
  }

  const filtered = campaigns.filter((c) => {
    const matchesStatus = statusFilter === "all" ? true : c.status === statusFilter
    const term = searchTerm.trim().toLowerCase()
    if (!term) return matchesStatus
    return c.title.toLowerCase().includes(term)
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
          <CardTitle className="text-xl font-semibold text-foreground">Campaigns</CardTitle>
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_review">Under review</SelectItem>
                  <SelectItem value="awaiting_payment">Awaiting payment</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Search by title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs w-[220px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading campaigns…</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground px-6 py-3">Campaign Name</TableHead>
                    <TableHead className="text-muted-foreground px-6 py-3">Status</TableHead>
                    <TableHead className="min-w-[150px] text-muted-foreground px-6 py-3">Created / End Date</TableHead>
                    <TableHead className="text-muted-foreground px-6 py-3">Total Views</TableHead>
                    <TableHead className="text-muted-foreground px-6 py-3">Budget</TableHead>
                    <TableHead className="text-right min-w-[120px] text-muted-foreground px-6 py-3">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                        No campaigns yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium text-foreground px-6 py-3">{campaign.title}</TableCell>
                        <TableCell className="px-6 py-3">{renderStatusBadge(campaign.status)}</TableCell>
                        <TableCell className="text-muted-foreground px-6 py-3">
                          {formatDate(campaign.created_at)}{" "}
                          <span className="text-xs text-muted-foreground/80">→</span>{" "}
                          {formatDate(campaign.end_date)}
                        </TableCell>
                        <TableCell className="text-muted-foreground px-6 py-3">
                          {campaign.total_views.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-muted-foreground px-6 py-3">
                          ₹{campaign.total_budget.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right px-6 py-3 text-xs text-muted-foreground">
                          —
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
