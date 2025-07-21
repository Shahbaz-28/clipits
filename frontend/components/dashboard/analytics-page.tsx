"use client"

import { AnalyticsOverviewCards } from "./analytics/analytics-overview-cards"
import { AnalyticsCampaignTable } from "./analytics/analytics-campaign-table"
import { AnalyticsClipperSubmissionsTable } from "./analytics/analytics-clipper-submissions-table"
import { BarChart, LayoutGrid, ListChecks, Users } from "lucide-react" // Added LineChart icon
import { Card, CardHeader, CardTitle } from "@/components/ui/card" // Import CardContent

export function AnalyticsPage() {
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
          <AnalyticsOverviewCards />
        </section>
        {/* Clipper Submissions Section */}
        <section>
          <h3 className="text-xl font-bold text-heading-text mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-label" />
            Clipper Submissions
          </h3>
          <AnalyticsClipperSubmissionsTable />
        </section>
        {/* Campaign Management Section */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-heading-text mb-4 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-muted-label" />
            Campaign Management
          </h3>
          <AnalyticsCampaignTable />
        </section>
      </Card>
    </div>
  )
}
