"use client"

import { useEffect, useMemo, useState } from "react"
import { AnalyticsOverviewCards } from "./analytics/analytics-overview-cards"
import type { AnalyticsOverviewStats } from "./analytics/analytics-overview-cards"
import { AnalyticsCampaignTable } from "./analytics/analytics-campaign-table"
import type { AnalyticsCampaignRow } from "./analytics/analytics-campaign-table"
import { BarChart, LayoutGrid, ListChecks } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

const EMPTY_STATS: AnalyticsOverviewStats = {
  totalCampaigns: 0,
  totalViewsGenerated: 0,
  totalAmountSpent: 0,
  totalApprovedPosts: 0,
}

interface CampaignQueryRow {
  id: string
  title: string
  created_at: string | null
  end_date: string | null
  total_budget: number | null
  status: string
}

interface SubmissionQueryRow {
  campaign_id: string
  view_count: number | null
  earnings: number | null
}

export function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AnalyticsOverviewStats>(EMPTY_STATS)
  const [campaignRows, setCampaignRows] = useState<AnalyticsCampaignRow[]>([])

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.id) {
        setStats(EMPTY_STATS)
        setCampaignRows([])
        setLoading(false)
        return
      }

      setLoading(true)
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("id, title, created_at, end_date, total_budget, status")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })

      if (campaignsError || !campaignsData) {
        setStats(EMPTY_STATS)
        setCampaignRows([])
        setLoading(false)
        return
      }

      const campaigns = campaignsData as CampaignQueryRow[]
      const campaignIds = campaigns.map((c) => c.id)

      let submissions: SubmissionQueryRow[] = []
      if (campaignIds.length > 0) {
        const { data: submissionsData } = await supabase
          .from("submissions")
          .select("campaign_id, view_count, earnings")
          .eq("status", "approved")
          .in("campaign_id", campaignIds)
        submissions = (submissionsData as SubmissionQueryRow[] | null) ?? []
      }

      const byCampaign = new Map<string, { views: number; earnings: number; approved: number }>()
      for (const s of submissions) {
        const prev = byCampaign.get(s.campaign_id) ?? { views: 0, earnings: 0, approved: 0 }
        prev.views += Number(s.view_count ?? 0)
        prev.earnings += Number(s.earnings ?? 0)
        prev.approved += 1
        byCampaign.set(s.campaign_id, prev)
      }

      const nextCampaignRows: AnalyticsCampaignRow[] = campaigns.map((c) => {
        const agg = byCampaign.get(c.id) ?? { views: 0, earnings: 0, approved: 0 }
        const startDate = c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : "—"
        const endDate = c.end_date ? new Date(c.end_date).toLocaleDateString("en-IN") : "—"
        return {
          id: c.id,
          name: c.title || "Untitled Campaign",
          startDate,
          endDate,
          budget: Number(c.total_budget ?? 0),
          totalViews: agg.views,
          status: c.status ?? "draft",
        }
      })

      const totals = submissions.reduce(
        (acc, s) => {
          acc.views += Number(s.view_count ?? 0)
          acc.earnings += Number(s.earnings ?? 0)
          return acc
        },
        { views: 0, earnings: 0 }
      )

      setStats({
        totalCampaigns: campaigns.length,
        totalViewsGenerated: totals.views,
        totalAmountSpent: totals.earnings,
        totalApprovedPosts: submissions.length,
      })
      setCampaignRows(nextCampaignRows)
      setLoading(false)
    }

    void loadAnalytics()
  }, [user?.id])

  const overviewStats = useMemo(() => stats, [stats])

  if (loading) {
    return (
      <div className="min-h-[320px] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-vibrant-red-orange" />
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 gap-6">
      {" "}
      {/* Removed bg-section-bg and padding */}
      <Card className="bg-main-bg border-border shadow-sm p-6 lg:p-6 rounded-xl">
        {" "}
        {/* Added rounded-xl */}
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-3xl font-bold text-heading-text flex items-center gap-3">
            <BarChart className="w-8 h-8 text-muted-label" />
            Analytics Dashboard
          </CardTitle>
          <p className="text-muted-label text-lg mt-2">
            Gain comprehensive insights into your campaigns and creator performance.
          </p>
        </CardHeader>
        {/* Overview Section */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-heading-text mb-4 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-muted-label" />
            Overview
          </h3>
          <AnalyticsOverviewCards stats={overviewStats} />
        </section>
        {/* Campaign Management Section */}
        <section>
          <h3 className="text-xl font-bold text-heading-text mb-4 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-muted-label" />
            Campaign Management
          </h3>
          <AnalyticsCampaignTable campaigns={campaignRows} />
        </section>
      </Card>
    </div>
  )
}
