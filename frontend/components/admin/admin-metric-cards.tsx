"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Megaphone, Eye, IndianRupee } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AdminMetrics {
  totalCreators: number
  totalCampaigns: number
  totalViews: number
  totalPayouts: number
}

export function AdminMetricCards() {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalCreators: 0,
    totalCampaigns: 0,
    totalViews: 0,
    totalPayouts: 0,
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [{ count: creatorsCount }, { count: campaignsCount }] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "creator"),
          supabase.from("campaigns").select("*", { count: "exact", head: true }),
        ])

        const { data: submissions, error: submissionsError } = await supabase
          .from("submissions")
          .select("view_count, earnings")
          .eq("status", "approved")

        if (submissionsError) {
          // If submissions query fails, still show counts
          setMetrics({
            totalCreators: creatorsCount ?? 0,
            totalCampaigns: campaignsCount ?? 0,
            totalViews: 0,
            totalPayouts: 0,
          })
          return
        }

        let totalViews = 0
        let totalPayouts = 0

        for (const row of submissions ?? []) {
          totalViews += Number((row as { view_count?: number }).view_count ?? 0)
          totalPayouts += Number((row as { earnings?: number }).earnings ?? 0)
        }

        setMetrics({
          totalCreators: creatorsCount ?? 0,
          totalCampaigns: campaignsCount ?? 0,
          totalViews,
          totalPayouts,
        })
      } catch {
        // Swallow errors for now and keep zeros
      }
    }

    void fetchMetrics()
  }, [])

  const cards = [
    {
      title: "Total Approved Creators",
      value: metrics.totalCreators.toLocaleString("en-IN"),
      change: "—",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Total Campaigns",
      value: metrics.totalCampaigns.toLocaleString("en-IN"),
      change: "—",
      icon: Megaphone,
      color: "text-accent",
    },
    {
      title: "Total Views Generated",
      value: metrics.totalViews.toLocaleString("en-IN"),
      change: "—",
      icon: Eye,
      color: "text-highlight",
    },
    {
      title: "Total Payouts Released",
      value: `₹${metrics.totalPayouts.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: "—",
      icon: IndianRupee,
      color: "text-primary",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((metric, index) => (
        <Card key={index} className="shadow-sm border border-border rounded-lg">
          {" "}
          {/* Added rounded-lg */}
          <CardHeader className="flex flex-row items-start justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color} shrink-0`} />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
