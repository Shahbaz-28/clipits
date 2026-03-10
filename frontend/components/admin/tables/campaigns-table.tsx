"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash, Eye, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
            supabase.from("submissions").select("campaign_id, view_count"),
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

  return (
    <Card className="shadow-sm border border-border rounded-xl">
      {" "}
      {/* Added rounded-xl */}
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-xl font-semibold text-foreground">Campaigns</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading campaigns…</span>
          </div>
        ) : (
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
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      No campaigns yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
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
                      <TableCell className="text-right px-6 py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                          <Edit className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                          <Trash className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
