"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FolderOpen, Eye, Instagram, Loader2, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { mapCampaignRowToCard, type CampaignCard, type CampaignRow } from "@/lib/campaigns"
import { toast } from "sonner"

interface JoinedCampaignsListPageProps {
  onNavigate: (path: string, campaignData?: CampaignCard) => void
}

export function JoinedCampaignsListPage({ onNavigate }: JoinedCampaignsListPageProps) {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<CampaignCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    if (!user?.id) {
      setCampaigns([])
      setLoading(false)
      return
    }
    async function load() {
      if (!user?.id) return
      setLoading(true)
      const { data: joins, error: joinsError } = await supabase
        .from("user_campaigns")
        .select("campaign_id")
        .eq("user_id", user.id)

      if (joinsError) {
        toast.error(joinsError.message)
        setCampaigns([])
        setLoading(false)
        return
      }

      const campaignIds = (joins || []).map((j) => j.campaign_id).filter(Boolean)
      if (campaignIds.length === 0) {
        setCampaigns([])
        setLoading(false)
        return
      }

      const [{ data: rows, error: campaignsError }, { data: submissions, error: submissionsError }] =
        await Promise.all([
          supabase
            .from("campaigns")
            .select("*")
            .in("id", campaignIds)
            .order("created_at", { ascending: false }),
          supabase.from("submissions").select("campaign_id, view_count").eq("status", "approved"),
        ])

      if (campaignsError) {
        toast.error(campaignsError.message)
        setCampaigns([])
        setLoading(false)
        return
      }

      const viewsByCampaign: Record<string, number> = {}
      if (!submissionsError && submissions) {
        for (const s of submissions) {
          const cid = (s as { campaign_id?: string }).campaign_id
          const v = Number((s as { view_count?: number }).view_count ?? 0)
          if (cid) viewsByCampaign[cid] = (viewsByCampaign[cid] ?? 0) + v
        }
      }

      const list = (rows || []).map((row) => {
        const r = row as CampaignRow & { id: string }
        return mapCampaignRowToCard(r, { instagram: Instagram }, {
          totalViews: viewsByCampaign[r.id] ?? 0,
        })
      })
      setCampaigns(list)
      setLoading(false)
    }
    load()
  }, [user?.id])

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const filtered = campaigns.filter((c) => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true
    return (
      c.title.toLowerCase().includes(term) ||
      (c.description ?? "").toLowerCase().includes(term)
    )
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <h1 className="text-3xl font-extrabold text-white mb-4">Joined Campaigns</h1>
        <p className="text-rippl-gray font-medium text-base mb-6">Campaigns you&apos;ve joined</p>
        <div className="flex items-center gap-2 py-12 text-rippl-gray">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading joined campaigns...</span>
        </div>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <h1 className="text-3xl font-extrabold text-white mb-4">Joined Campaigns</h1>
        <p className="text-rippl-gray font-medium text-base mb-6">Campaigns you&apos;ve joined</p>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-5 rounded-full bg-rippl-black-3/50 mb-4 border border-rippl-black-3">
            <FolderOpen className="w-10 h-10 text-rippl-gray" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">No campaigns yet</h2>
          <p className="text-sm font-medium text-rippl-gray max-w-sm">Join campaigns from Explore to see them here.</p>
        </div>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <h1 className="text-3xl font-extrabold text-white mb-4">Joined Campaigns</h1>
        <p className="text-rippl-gray font-medium text-base mb-6">Campaigns you&apos;ve joined. Click to view details and submit content.</p>
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rippl-gray/50" />
          <Input
            placeholder="Search campaigns"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet transition-all"
          />
        </div>
        <div className="text-center py-12 text-rippl-gray font-medium">
          No campaigns match your search.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-3xl font-extrabold text-white mb-4">Joined Campaigns</h1>
      <p className="text-rippl-gray font-medium text-base mb-6">Campaigns you&apos;ve joined. Click to view details and submit content.</p>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rippl-gray/50" />
          <Input
            placeholder="Search campaigns by title or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-rippl-black-3/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl focus:border-rippl-violet focus:ring-1 focus:ring-rippl-violet transition-all"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginated.map((campaign) => (
          <Card
            key={campaign.id}
            className="bg-rippl-black-2/50 border border-rippl-black-3 shadow-md hover:border-rippl-violet transition-all duration-300 cursor-pointer group rounded-[24px] overflow-hidden"
            onClick={() => onNavigate("joined-campaign", campaign)}
          >
            {campaign.thumbnailUrl && (
              <div className="w-full h-32 bg-rippl-black-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={campaign.thumbnailUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-white mb-1.5 group-hover:text-rippl-violet transition-colors">
                    {campaign.title}
                  </h3>
                  <Badge
                    className={`${campaign.color} text-white hover:${campaign.color}/90 text-xs shadow-sm rounded-lg font-bold px-2.5 py-0.5`}
                  >
                    {campaign.rate}
                  </Badge>
                </div>
              </div>

              <p className="text-sm font-medium text-rippl-gray mb-5 h-10 overflow-hidden text-ellipsis line-clamp-2">
                {campaign.description || "—"}
              </p>

              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-extrabold text-emerald-400">{campaign.earnings}</span>
                  <span className="text-xs font-bold text-rippl-gray">of {campaign.total} paid out</span>
                  <span className="text-sm font-extrabold text-white">{campaign.percentage}</span>
                </div>
                <div className="w-full bg-rippl-black-3 rounded-full h-2">
                  <div
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    style={{ width: campaign.percentage }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="font-bold text-rippl-gray mb-1">Type</p>
                  <p className="font-extrabold text-white capitalize">{campaign.type}</p>
                </div>
                <div>
                  <p className="font-bold text-rippl-gray mb-1">Platforms</p>
                  <div className="flex space-x-1">
                    {campaign.platforms.map((Platform, idx) => (
                      <Platform key={`platform-${idx}`} className="w-4 h-4 text-white" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-rippl-gray mb-1">Views</p>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5 text-white" />
                    <span className="font-extrabold text-white">{campaign.views}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length > pageSize && (
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-rippl-black-3 text-sm font-medium text-rippl-gray">
          <span>
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 px-4 text-xs font-bold border-rippl-black-3 text-white bg-rippl-black-2/50 hover:bg-rippl-black-3 transition-colors rounded-xl"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 px-4 text-xs font-bold border-rippl-black-3 text-white bg-rippl-black-2/50 hover:bg-rippl-black-3 transition-colors rounded-xl"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
