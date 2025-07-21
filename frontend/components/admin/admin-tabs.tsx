"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreatorRequestsTable } from "@/components/admin/tables/creator-requests-table"
import { CampaignsTable } from "@/components/admin/tables/campaigns-table"
import { ClipperSubmissionsTable } from "@/components/admin/tables/clipper-submissions-table"
import { WalletPayoutsTable } from "@/components/admin/tables/wallet-payouts-table"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function AdminTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get("tab") || "creator-requests"
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [searchParams, activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/admin?tab=${value}`, { scroll: false })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-4 h-auto bg-muted/50 rounded-lg p-1 shadow-sm border border-border">
        <TabsTrigger
          value="creator-requests"
          className="py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-md text-sm font-medium"
        >
          Creator Requests
        </TabsTrigger>
        <TabsTrigger
          value="campaigns"
          className="py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-md text-sm font-medium"
        >
          Campaigns
        </TabsTrigger>
        <TabsTrigger
          value="clipper-submissions"
          className="py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-md text-sm font-medium"
        >
          Clipper Submissions
        </TabsTrigger>
        <TabsTrigger
          value="wallet-payouts"
          className="py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-md text-sm font-medium"
        >
          Wallet & Payouts
        </TabsTrigger>
      </TabsList>
      <TabsContent value="creator-requests" className="mt-6">
        <CreatorRequestsTable />
      </TabsContent>
      <TabsContent value="campaigns" className="mt-6">
        <CampaignsTable />
      </TabsContent>
      <TabsContent value="clipper-submissions" className="mt-6">
        <ClipperSubmissionsTable />
      </TabsContent>
      <TabsContent value="wallet-payouts" className="mt-6">
        <WalletPayoutsTable />
      </TabsContent>
    </Tabs>
  )
}
