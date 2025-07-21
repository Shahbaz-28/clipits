import { AdminMetricCards } from "@/components/admin/admin-metric-cards"
import { AdminTabs } from "@/components/admin/admin-tabs"
import { LayoutDashboard } from "lucide-react" // Import icon

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-heading-text mb-2 flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-muted-label" />
        Admin Dashboard
      </h1>
      <p className="text-muted-label text-lg mt-2">Manage creators, campaigns, submissions, and payouts.</p>
      <AdminMetricCards />
      <AdminTabs />
    </div>
  )
}
