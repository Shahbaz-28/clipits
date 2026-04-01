import { Card, CardContent } from "@/components/ui/card"
import { LayoutGrid, Eye, IndianRupee, CheckCircle } from "lucide-react"

export interface AnalyticsOverviewStats {
  totalCampaigns: number
  totalViewsGenerated: number
  totalAmountSpent: number
  totalApprovedPosts: number
}

export function AnalyticsOverviewCards({ stats }: { stats: AnalyticsOverviewStats }) {
  const overviewStats = [
    {
      title: "Total Campaigns",
      value: stats.totalCampaigns.toLocaleString("en-IN"),
      icon: LayoutGrid,
      color: "text-rippl-violet",
      bgColor: "bg-rippl-violet/10",
    },
    {
      title: "Total Views Generated",
      value: stats.totalViewsGenerated.toLocaleString("en-IN"),
      icon: Eye,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      title: "Total Amount Spent",
      value: `₹${Math.round(stats.totalAmountSpent).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Total Approved Posts",
      value: stats.totalApprovedPosts.toLocaleString("en-IN"),
      icon: CheckCircle,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewStats.map((stat) => (
        <Card key={stat.title} className="bg-main-bg border-border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rippl-gray uppercase tracking-wider mb-1">{stat.title}</p>
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor} shadow-sm`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
