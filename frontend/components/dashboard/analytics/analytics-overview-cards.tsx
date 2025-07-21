import { Card, CardContent } from "@/components/ui/card"
import { LayoutGrid, Eye, DollarSign, CheckCircle } from "lucide-react"

const overviewStats = [
  {
    title: "Total Campaigns",
    value: "48",
    icon: LayoutGrid,
    color: "text-vibrant-red-orange",
    bgColor: "bg-vibrant-red-orange/10",
  },
  {
    title: "Total Views Generated",
    value: "15.2M",
    icon: Eye,
    color: "text-turquoise-accent",
    bgColor: "bg-turquoise-accent/10",
  },
  {
    title: "Total Amount Spent",
    value: "₹85,000",
    icon: DollarSign,
    color: "text-vibrant-red-orange",
    bgColor: "bg-vibrant-red-orange/10",
  },
  {
    title: "Total Approved Posts",
    value: "320",
    icon: CheckCircle,
    color: "text-sunny-yellow",
    bgColor: "bg-sunny-yellow/10",
  },
]

export function AnalyticsOverviewCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewStats.map((stat) => (
        <Card key={stat.title} className="bg-main-bg border-border hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-label mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-heading-text">{stat.value}</p>
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
