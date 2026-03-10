"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Instagram, Eye } from "lucide-react"
import { CampaignDetailsModal } from "./campaign-details-modal"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { CampaignRow, CampaignCard } from "@/lib/campaigns"
import { mapCampaignRowToCard } from "@/lib/campaigns"
import { toast } from "sonner"

interface CampaignGridProps {
  onNavigate: (path: string, campaignData?: CampaignCard) => void
  refreshKey?: number
}

export function CampaignGrid({ onNavigate, refreshKey = 0 }: CampaignGridProps) {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<CampaignCard[]>([])
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignCard | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data: rows, error: campaignsError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("status", "live")
          .order("created_at", { ascending: false })

        if (campaignsError) {
          setError(campaignsError.message)
          setCampaigns([])
          setLoading(false)
          return
        }

        const mapped = (rows || []).map((row: CampaignRow) =>
          mapCampaignRowToCard(row, { instagram: Instagram })
        )
        setCampaigns(mapped)

        if (user?.id) {
          const { data: joins } = await supabase
            .from("user_campaigns")
            .select("campaign_id")
            .eq("user_id", user.id)
          setJoinedIds(new Set((joins || []).map((j) => j.campaign_id)))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, refreshKey])

  const handleCardClick = (campaign: CampaignCard) => {
    setSelectedCampaign(campaign)
    setIsDetailsModalOpen(true)
  }

  const handleJoin = async (campaign: CampaignCard) => {
    if (!user?.id) return
    setJoiningId(campaign.id)
    setError(null)
    const TIMEOUT_MS = 15000
    const insertPromise = supabase.from("user_campaigns").insert({
      user_id: user.id,
      campaign_id: campaign.id,
    })
    const timeoutPromise = new Promise<{ error: { message: string } }>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out. Check your network and try again.")), TIMEOUT_MS)
    )
    try {
      const result = await Promise.race([insertPromise, timeoutPromise])
      const insertError = result?.error
      if (insertError) {
        const code = "code" in insertError ? insertError.code : null
        if (code === "23505") {
          setJoinedIds((prev) => new Set(prev).add(campaign.id))
          setIsDetailsModalOpen(false)
          onNavigate("joined-campaign", campaign)
        } else {
          setError(insertError.message)
          toast.error(insertError.message)
        }
        return
      }
      setJoinedIds((prev) => new Set(prev).add(campaign.id))
      setSelectedCampaign(null)
      setIsDetailsModalOpen(false)
      onNavigate("joined-campaign", campaign)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join campaign."
      setError(message)
      toast.error(message)
    } finally {
      setJoiningId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-vibrant-red-orange border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        {error}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-muted-label">
        No live campaigns yet. Check back later.
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {campaigns.map((campaign) => (
          <Card
            key={campaign.id}
            className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group rounded-2xl overflow-hidden"
            onClick={() => handleCardClick(campaign)}
          >
            {campaign.thumbnailUrl && (
              <div className="w-full h-32 bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={campaign.thumbnailUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <CardContent className="p-6">
              {/* Header */}
              <div className="mb-5">
                <h3 className="font-bold text-lg text-heading-text mb-3 group-hover:text-vibrant-red-orange transition-colors line-clamp-2 leading-tight">
                  {campaign.title}
                </h3>
                <Badge
                  className={`${campaign.color} text-white hover:${campaign.color}/90 text-xs font-semibold px-3 py-1 rounded-full shadow-sm`}
                >
                  {campaign.rate}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-label mb-5 line-clamp-2 leading-relaxed">
                {campaign.description}
              </p>

              {/* Earnings Progress */}
              <div className="mb-5 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-turquoise-accent">{campaign.earnings}</span>
                    <span className="text-xs text-muted-label">of {campaign.total}</span>
                  </div>
                  <span className="text-sm font-bold text-heading-text">{campaign.percentage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-turquoise-accent to-secondary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: campaign.percentage }}
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-muted-label mb-1">Type</p>
                  <p className="text-sm font-semibold text-heading-text">{campaign.type}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-muted-label mb-1">Platform</p>
                  <div className="flex justify-center">
                    {campaign.platforms.map((Platform, idx) => (
                      <Platform key={`platform-${idx}`} className="w-5 h-5 text-heading-text" />
                    ))}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-muted-label mb-1">Views</p>
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-muted-label" />
                    <span className="text-sm font-semibold text-heading-text">{campaign.views}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCampaign && (
        <CampaignDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          campaign={selectedCampaign}
          onJoin={() => handleJoin(selectedCampaign)}
          isJoining={joiningId === selectedCampaign.id}
          alreadyJoined={joinedIds.has(selectedCampaign.id)}
        />
      )}
    </>
  )
}
