"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { JoinedCampaignPage } from "@/components/dashboard/joined-campaign-page"
import { mapCampaignRowToCard } from "@/lib/campaigns"
import type { CampaignRow } from "@/lib/campaigns"
import { supabase } from "@/lib/supabase"
import { Instagram } from "lucide-react"
import { toast } from "sonner"

export default function JoinedCampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [campaign, setCampaign] = useState<ReturnType<typeof mapCampaignRowToCard> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("status", "active")
        .single()
      if (error || !data) {
        toast.error("Campaign not found or not available.")
        router.replace("/dashboard/joined")
        return
      }
      const card = mapCampaignRowToCard(data as CampaignRow, { instagram: Instagram })
      setCampaign(card)
      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-vibrant-red-orange border-t-transparent" />
      </div>
    )
  }

  if (!campaign) return null

  return (
    <JoinedCampaignPage
      campaign={campaign}
      onBackToList={() => router.push("/dashboard/joined")}
    />
  )
}
