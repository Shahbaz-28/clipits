import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, DollarSign, CheckCircle, Star } from "lucide-react"

const stats = [
  {
    title: "Active Campaigns",
    value: "24",
    icon: TrendingUp,
    color: "text-vibrant-red-orange",
    bgColor: "bg-vibrant-red-orange/10",
  },
  {
    title: "Total Earnings",
    value: "$12.5K",
    icon: DollarSign,
    color: "text-turquoise-accent",
    bgColor: "bg-turquoise-accent/10",
  },
  {
    title: "Success Rate",
    value: "94%",
    icon: CheckCircle,
    color: "text-vibrant-red-orange",
    bgColor: "bg-vibrant-red-orange/10",
  },
  {
    title: "Avg. Rating",
    value: "4.8",
    icon: Star,
    color: "text-sunny-yellow",
    bgColor: "bg-sunny-yellow/10",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="bg-main-bg border-border shadow-md hover:shadow-lg transition-shadow rounded-xl"
        >
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
