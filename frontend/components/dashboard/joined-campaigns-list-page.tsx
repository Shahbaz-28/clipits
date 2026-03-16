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
        <h1 className="text-2xl font-bold text-heading-text mb-4">Joined Campaigns</h1>
        <p className="text-muted-label mb-6">Campaigns you&apos;ve joined</p>
        <div className="flex items-center gap-2 py-12 text-muted-label">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading joined campaigns...</span>
        </div>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <h1 className="text-2xl font-bold text-heading-text mb-4">Joined Campaigns</h1>
        <p className="text-muted-label mb-6">Campaigns you&apos;ve joined</p>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-section-bg mb-4">
            <FolderOpen className="w-12 h-12 text-muted-label" />
          </div>
          <h2 className="text-xl font-semibold text-heading-text mb-2">No campaigns yet</h2>
          <p className="text-muted-label max-w-sm">Join campaigns from Explore to see them here.</p>
        </div>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <h1 className="text-2xl font-bold text-heading-text mb-4">Joined Campaigns</h1>
        <p className="text-muted-label mb-6">Campaigns you&apos;ve joined. Click to view details and submit content.</p>
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-label" />
          <Input
            placeholder="Search campaigns"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="text-center py-12 text-muted-label">
          No campaigns match your search.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold text-heading-text mb-4">Joined Campaigns</h1>
      <p className="text-muted-label mb-6">Campaigns you&apos;ve joined. Click to view details and submit content.</p>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-label" />
          <Input
            placeholder="Search campaigns by title or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginated.map((campaign) => (
          <Card
            key={campaign.id}
            className="bg-main-bg border border-border shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group rounded-xl overflow-hidden"
            onClick={() => onNavigate("joined-campaign", campaign)}
          >
            {campaign.thumbnailUrl && (
              <div className="w-full h-28 bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={campaign.thumbnailUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-heading-text mb-1 group-hover:text-turquoise-accent transition-colors">
                    {campaign.title}
                  </h3>
                  <Badge
                    className={`${campaign.color} text-white hover:${campaign.color}/90 text-xs shadow-sm rounded-md`}
                  >
                    {campaign.rate}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-body-text mb-4">
                {campaign.description.length > 50
                  ? `${campaign.description.substring(0, 50)}...`
                  : campaign.description || "—"}
              </p>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-turquoise-accent">{campaign.earnings}</span>
                  <span className="text-sm text-muted-label">of {campaign.total} paid out</span>
                  <span className="text-sm font-semibold text-body-text">{campaign.percentage}</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="bg-turquoise-accent h-2 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: campaign.percentage }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-muted-label mb-1">Type</p>
                  <p className="font-semibold text-body-text">{campaign.type}</p>
                </div>
                <div>
                  <p className="text-muted-label mb-1">Platforms</p>
                  <div className="flex space-x-1">
                    {campaign.platforms.map((Platform, idx) => (
                      <Platform key={`platform-${idx}`} className="w-4 h-4 text-muted-label" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-label mb-1">Views</p>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3 text-muted-label" />
                    <span className="font-semibold text-body-text">{campaign.views}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length > pageSize && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border text-sm text-muted-label">
          <span>
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
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
