"use client"

import { MyCampaignsPage } from "@/components/dashboard/my-campaigns-page"
import { useCampaignData } from "@/lib/campaign-data-context"

export default function MyCampaignsRoutePage() {
  const { prefetchedCampaigns, prefetchCampaignsLoading, refreshCreatorCampaigns } = useCampaignData()

  return (
    <MyCampaignsPage
      prefetchedCampaigns={prefetchedCampaigns}
      prefetchCampaignsLoading={prefetchCampaignsLoading}
      onRefreshCreatorCampaigns={refreshCreatorCampaigns}
    />
  )
}
