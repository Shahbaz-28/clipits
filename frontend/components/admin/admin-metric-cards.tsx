import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Megaphone, Eye, DollarSign } from "lucide-react"

export function AdminMetricCards() {
  const metrics = [
    {
      title: "Total Approved Creators",
      value: "1,234",
      change: "+20% from last month",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Total Campaigns",
      value: "567",
      change: "+15% from last month",
      icon: Megaphone,
      color: "text-accent",
    },
    {
      title: "Total Views Generated",
      value: "1.2M",
      change: "+30% from last month",
      icon: Eye,
      color: "text-highlight",
    },
    {
      title: "Total Payouts Released",
      value: "$125,000",
      change: "+25% from last month",
      icon: DollarSign,
      color: "text-primary",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
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
