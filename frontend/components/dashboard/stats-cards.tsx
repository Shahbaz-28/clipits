import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, IndianRupee, CheckCircle, Star } from "lucide-react"

const stats = [
  {
    title: "Active Campaigns",
    value: "0",
    icon: TrendingUp,
    color: "text-rippl-violet",
    bgColor: "bg-rippl-violet/10",
  },
  {
    title: "Total Earnings",
    value: "₹0",
    icon: IndianRupee,
    color: "text-turquoise-accent",
    bgColor: "bg-turquoise-accent/10",
  },
  {
    title: "Success Rate",
    value: "—",
    icon: CheckCircle,
    color: "text-rippl-violet",
    bgColor: "bg-rippl-violet/10",
  },
  {
    title: "Avg. Rating",
    value: "—",
    icon: Star,
    color: "text-sunny-yellow",
    bgColor: "bg-sunny-yellow/10",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="bg-rippl-black-2 border-rippl-black-3 shadow-xl hover:shadow-2xl transition-all rounded-[32px] group overflow-hidden"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rippl-gray uppercase tracking-widest mb-1">{stat.title}</p>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bgColor} shadow-lg transition-transform group-hover:scale-110`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
