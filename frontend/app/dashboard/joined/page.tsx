"use client"

import { JoinedCampaignsListPage } from "@/components/dashboard/joined-campaigns-list-page"
import { useRouter } from "next/navigation"

export default function JoinedPage() {
  const router = useRouter()

  const handleNavigate = (path: string, campaignData?: unknown) => {
    if (path === "joined-campaign" && campaignData && typeof campaignData === "object" && "id" in campaignData) {
      router.push(`/dashboard/joined/${(campaignData as { id: string }).id}`)
    } else {
      router.push(`/dashboard/${path}`)
    }
  }

  return <JoinedCampaignsListPage onNavigate={handleNavigate} />
}
