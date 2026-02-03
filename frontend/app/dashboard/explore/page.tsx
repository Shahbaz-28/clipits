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
    <>
      <h1 className="text-2xl font-bold text-heading-text mb-4">Explore Campaigns</h1>
      <p className="text-muted-label mt-1 mb-6">
        {isCreator ? "Browse campaigns on the platform" : "Discover new opportunities to earn rewards"}
      </p>
      <CampaignGrid onNavigate={handleNavigate} refreshKey={refreshKey} />
    </>
  )
}
