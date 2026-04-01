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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-rippl-violet border-t-transparent" />
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rippl-gray" />
            <Input
              placeholder="Search campaigns by title or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 bg-rippl-black-2/50 border border-rippl-black-3 text-white placeholder:text-rippl-gray/50 rounded-xl"
            />
          </div>
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rippl-gray whitespace-nowrap">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as "all" | "live" | "completed")}
              >
                <SelectTrigger className="h-11 w-[130px] bg-rippl-black-2/50 border-rippl-black-3 text-white rounded-xl focus:border-rippl-violet focus:ring-rippl-violet">
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
              <span className="text-xs font-bold text-rippl-gray whitespace-nowrap">Category</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 w-[140px] bg-rippl-black-2/50 border-rippl-black-3 text-white rounded-xl focus:border-rippl-violet focus:ring-rippl-violet">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginated.map((campaign) => (
          <Card
            key={campaign.id}
            className="bg-rippl-black-2/50 border border-rippl-black-3 shadow-md hover:border-rippl-violet transition-all duration-300 cursor-pointer group rounded-[32px] overflow-hidden"
            onClick={() => handleCardClick(campaign)}
          >
            {campaign.thumbnailUrl && (
              <div className="w-full h-32 bg-rippl-black-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={campaign.thumbnailUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-extrabold text-white mb-2 group-hover:text-rippl-violet transition-colors text-lg line-clamp-2">
                    {campaign.title}
                  </h3>
                  <Badge
                    className="bg-rippl-violet text-white hover:bg-rippl-violet/90 text-xs shadow-sm shadow-rippl-violet/20 rounded-lg px-2 py-0.5 font-bold"
                  >
                    {campaign.rate}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-rippl-gray font-medium mb-5 h-10 line-clamp-2">
                {campaign.description || "—"}
              </p>

              <div className="mb-6">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xl font-extrabold text-rippl-violet">{campaign.earnings}</span>
                  <span className="text-xs font-bold text-rippl-gray/70">of {campaign.total} paid out</span>
                  <span className="text-sm font-extrabold text-white">{campaign.percentage}</span>
                </div>
                <div className="w-full bg-rippl-black-3 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rippl-violet h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    style={{ width: campaign.percentage }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs mt-4 pt-4 border-t border-rippl-black-3/50">
                <div>
                  <p className="text-rippl-gray font-bold mb-1">Type</p>
                  <p className="font-extrabold text-white capitalize">{campaign.type}</p>
                </div>
                <div>
                  <p className="text-rippl-gray font-bold mb-1">Platforms</p>
                  <div className="flex space-x-1.5">
                    {campaign.platforms.map((Platform, idx) => (
                      <Platform key={`platform-${idx}`} className="w-4 h-4 text-white" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-rippl-gray font-bold mb-1">Views</p>
                  <div className="flex items-center space-x-1.5">
                    <Eye className="w-4 h-4 text-white opacity-80" />
                    <span className="font-extrabold text-white">{campaign.views}</span>
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
