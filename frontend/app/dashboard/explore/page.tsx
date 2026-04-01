"use client"

import { useState } from "react"
import { CampaignGrid } from "@/components/dashboard/campaign-grid"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function ExplorePage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const isCreator = profile?.role === "creator"

  const handleNavigate = (path: string, campaignData?: unknown) => {
    if (path === "joined-campaign" && campaignData && typeof campaignData === "object" && "id" in campaignData) {
      router.push(`/dashboard/joined/${(campaignData as { id: string }).id}`)
    } else {
      router.push(`/dashboard/${path}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-rippl-black-3 pb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2">Explore Campaigns</h1>
        <p className="text-rippl-gray font-medium text-base">
          {isCreator
            ? "Browse campaigns on the platform."
            : "Browse live campaigns, join the ones you like, and earn per view."}
        </p>
      </div>

      {/* Campaigns Grid */}
      <CampaignGrid onNavigate={handleNavigate} refreshKey={refreshKey} />
    </div>
  )
}
