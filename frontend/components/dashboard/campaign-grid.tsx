"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Instagram, Eye, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CampaignDetailsModal } from "./campaign-details-modal"
import { supabase } from "@/lib/supabase"
import { authFetch } from "@/lib/api-client"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "completed">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // eslint-disable-next-line no-console
        console.log("[campaign-grid] loading campaigns for user", user?.id)
        const [{ data: rows, error: campaignsError }, { data: submissions, error: submissionsError }] =
          await Promise.all([
            supabase
              .from("campaigns")
              .select("*")
              .in("status", ["live", "completed"])
              .order("created_at", { ascending: false }),
            supabase.from("submissions").select("campaign_id, view_count").eq("status", "approved"),
          ])

        if (campaignsError) {
          setError(campaignsError.message)
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

        const mapped = (rows || []).map((row: CampaignRow) =>
          mapCampaignRowToCard(row, { instagram: Instagram }, {
            totalViews: viewsByCampaign[(row as { id: string }).id] ?? 0,
          })
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

  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter, categoryFilter])

  const handleCardClick = (campaign: CampaignCard) => {
    setSelectedCampaign(campaign)
    setIsDetailsModalOpen(true)
  }

  const handleJoin = async (campaign: CampaignCard) => {
    if (!user?.id) return
    setJoiningId(campaign.id)
    setError(null)
    try {
      const res = await authFetch("/api/campaigns/join", {
        method: "POST",
        body: JSON.stringify({ campaignId: campaign.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error || "Failed to join campaign."
        setError(msg)
        toast.error(msg)
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
        No campaigns yet. Check back later.
      </div>
    )
  }

  const categories = Array.from(
    new Set(campaigns.map((c) => c.category).filter(Boolean))
  ).sort((a, b) => (a as string).localeCompare(b as string)) as string[]

  const filtered = campaigns.filter((c) => {
    const term = searchTerm.trim().toLowerCase()
    if (term && !c.title.toLowerCase().includes(term) && !(c.description ?? "").toLowerCase().includes(term)) {
      return false
    }
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (categoryFilter !== "all" && (c.category || "") !== categoryFilter) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-muted-label">
        No campaigns match your search.
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-label" />
            <Input
              placeholder="Search campaigns by title or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as "all" | "live" | "completed")}
              >
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Category</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginated.map((campaign) => (
          <Card
            key={campaign.id}
            className="bg-main-bg border border-border shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group rounded-xl overflow-hidden"
            onClick={() => handleCardClick(campaign)}
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
