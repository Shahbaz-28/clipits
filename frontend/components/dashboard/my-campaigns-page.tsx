"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Grid3X3, Loader2, CheckCircle, XCircle, Clock, Pencil, Eye, Instagram } from "lucide-react"
import { CreateCampaignModal, type EditingCampaign } from "./create-campaign-modal"
import { CampaignDetailsModal } from "./campaign-details-modal"
import { mapCampaignRowToCard } from "@/lib/campaigns"
import type { CampaignCard, CampaignRow } from "@/lib/campaigns"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

interface MyCampaign extends EditingCampaign {
  category: string | null
  disclaimer: string | null
  status: "draft" | "pending_budget" | "active" | "ended"
  created_at: string
}

function normalizeCampaigns(rows: unknown[]): MyCampaign[] {
  return (rows as (MyCampaign & { requirements?: unknown; assets?: unknown; platforms?: unknown; disclaimer?: unknown })[]).map((row) => ({
    ...row,
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    assets: Array.isArray(row.assets) ? row.assets : [],
    platforms: Array.isArray(row.platforms) ? row.platforms : ["instagram"],
    disclaimer: row.disclaimer ?? null,
  }))
}

function myCampaignToCard(campaign: MyCampaign): CampaignCard {
  const row = {
    ...campaign,
    type: (campaign.type === "clipping" ? "clipping" : "ugc") as "ugc" | "clipping",
    flat_fee_bonus: 0,
    created_by: null,
    updated_at: campaign.created_at,
  } satisfies CampaignRow
  return mapCampaignRowToCard(row, { instagram: Instagram })
}

interface MyCampaignsPageProps {
  prefetchedCampaigns?: unknown[] | null
  prefetchCampaignsLoading?: boolean
  onRefreshCreatorCampaigns?: () => Promise<void>
}

export function MyCampaignsPage({
  prefetchedCampaigns = null,
  prefetchCampaignsLoading = false,
  onRefreshCreatorCampaigns,
}: MyCampaignsPageProps = {}) {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<MyCampaign | null>(null)
  const [detailsCampaign, setDetailsCampaign] = useState<CampaignCard | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [campaigns, setCampaigns] = useState<MyCampaign[]>(() =>
    Array.isArray(prefetchedCampaigns) ? normalizeCampaigns(prefetchedCampaigns) : []
  )
  const [loading, setLoading] = useState(() =>
    prefetchedCampaigns === undefined ? true : prefetchCampaignsLoading
  )

  const fetchCampaigns = async () => {
    if (!user?.id) {
      setCampaigns([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, description, rate_per_1k, total_budget, min_payout, max_payout, category, type, status, created_at, requirements, assets, platforms, end_date, disclaimer")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        toast.error(error.message)
        setCampaigns([])
        return
      }
      const rows = (data || []) as (MyCampaign & { requirements?: unknown; assets?: unknown; platforms?: unknown })[]
      setCampaigns(normalizeCampaigns(rows))
    } finally {
      setLoading(false)
    }
  }

  // Use prefetched data from Dashboard (loaded in parallel with auth) so data shows immediately
  useEffect(() => {
    if (Array.isArray(prefetchedCampaigns)) {
      setCampaigns(normalizeCampaigns(prefetchedCampaigns))
      setLoading(prefetchCampaignsLoading)
    }
  }, [prefetchedCampaigns, prefetchCampaignsLoading])

  // When not using prefetch (e.g. standalone), fetch on mount
  useEffect(() => {
    if (prefetchedCampaigns === undefined && user?.id) {
      fetchCampaigns()
    }
  }, [user?.id, prefetchedCampaigns])

  const refreshCampaigns = async () => {
    if (onRefreshCreatorCampaigns) {
      await onRefreshCreatorCampaigns()
    } else {
      await fetchCampaigns()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: typeof Clock; label: string }> = {
      draft: { className: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Draft" },
      pending_budget: { className: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending budget" },
      active: { className: "bg-turquoise-accent/10 text-turquoise-accent", icon: CheckCircle, label: "Active" },
      ended: { className: "bg-gray-100 text-gray-600", icon: XCircle, label: "Ended" },
    }
    const v = variants[status] || { className: "bg-gray-100 text-gray-600", icon: Clock, label: status }
    const Icon = v.icon
    return (
      <Badge className={`${v.className} rounded-md flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {v.label}
      </Badge>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading-text flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-muted-label" />
            My Campaigns
          </h1>
          <p className="text-muted-label mt-1 text-sm sm:text-base">Manage your created campaigns. Publish drafts so they appear in Explore for clippers.</p>
        </div>
        <Button
          className="w-full sm:w-auto bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 shadow-md shadow-vibrant-red-orange/20 rounded-md"
          onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Campaign list — same card layout as Explore; skeleton while loading */}
      {loading ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-heading-text">Your campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="bg-main-bg border border-border shadow-md rounded-xl overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 bg-section-bg rounded animate-pulse" />
                      <div className="h-5 w-16 bg-section-bg rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-16 bg-section-bg rounded animate-pulse" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 w-full bg-section-bg rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-section-bg rounded animate-pulse" />
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <div className="h-5 w-12 bg-section-bg rounded animate-pulse" />
                      <div className="h-3 w-24 bg-section-bg rounded animate-pulse" />
                    </div>
                    <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-section-bg rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-8 bg-section-bg rounded animate-pulse" />
                    ))}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border">
                    <div className="h-3 w-20 bg-section-bg rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-8 w-16 bg-section-bg rounded animate-pulse" />
                      <div className="h-8 w-20 bg-section-bg rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-heading-text">Your campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {campaigns.map((campaign) => {
              const rateLabel = `₹${Number(campaign.rate_per_1k).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / 1K`
              const totalLabel = `₹${Number(campaign.total_budget).toLocaleString("en-IN")}`
              const typeLabel = campaign.type === "ugc" ? "UGC" : "Clipping"
              return (
                <Card
                  key={campaign.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setDetailsCampaign(myCampaignToCard(campaign))
                    setIsDetailsModalOpen(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setDetailsCampaign(myCampaignToCard(campaign))
                      setIsDetailsModalOpen(true)
                    }
                  }}
                  className="bg-main-bg border border-border shadow-md hover:shadow-lg transition-all duration-200 rounded-xl cursor-pointer"
                >
                  <CardContent className="p-6">
                    {/* Header — title + rate badge (same as Explore) */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-heading-text mb-1">{campaign.title}</h3>
                        <Badge className="bg-vibrant-red-orange text-white text-xs shadow-sm rounded-md">
                          {rateLabel}
                        </Badge>
                      </div>
                      <div className="flex-shrink-0">{getStatusBadge(campaign.status)}</div>
                    </div>

                    {/* Description (truncated like Explore) */}
                    <p className="text-sm text-body-text mb-4">
                      {(campaign.description ?? "").substring(0, 50)}
                      {(campaign.description ?? "").length > 50 ? "..." : ""}
                    </p>

                    {/* Earnings / progress bar (same as Explore) */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-turquoise-accent">₹0</span>
                        <span className="text-sm text-muted-label">of {totalLabel} paid out</span>
                        <span className="text-sm font-semibold text-body-text">0%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className="bg-turquoise-accent h-2 rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: "0%" }}
                        />
                      </div>
                    </div>

                    {/* Type / Platforms / Views (same as Explore) */}
                    <div className="grid grid-cols-3 gap-4 text-xs mb-4">
                      <div>
                        <p className="text-muted-label mb-1">Type</p>
                        <p className="font-semibold text-body-text">{typeLabel}</p>
                      </div>
                      <div>
                        <p className="text-muted-label mb-1">Platforms</p>
                        <div className="flex space-x-1">
                          <Instagram className="w-4 h-4 text-muted-label" />
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-label mb-1">Views</p>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-muted-label" />
                          <span className="font-semibold text-body-text">0</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions for draft: only Edit; Publish is in the modal when editing */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
                      <p className="text-xs text-muted-label">Created {formatDate(campaign.created_at)}</p>
                      {campaign.status === "draft" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCampaign(campaign)
                            setIsModalOpen(true)
                          }}
                          className="border-border text-body-text hover:bg-section-bg"
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      )}
                      {campaign.status === "active" && (
                        <p className="text-xs text-turquoise-accent font-medium">Live in Explore</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        /* No Campaigns Yet Card */
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="bg-main-bg border-border w-full max-w-md p-6 sm:p-8 text-center shadow-lg rounded-xl">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-section-bg rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <Grid3X3 className="w-8 h-8 sm:w-10 sm:h-10 text-muted-label" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-heading-text mb-2">No campaigns yet</h2>
              <p className="text-sm sm:text-base text-body-text mb-6">
                Create your first campaign to start earning and engaging with creators
              </p>
              <Button
                className="w-full sm:w-auto bg-vibrant-red-orange text-white hover:bg-vibrant-red-orange/90 shadow-md shadow-vibrant-red-orange/20 rounded-md"
                onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => {
          setEditingCampaign(null)
          setIsModalOpen(false)
        }}
        onSuccess={refreshCampaigns}
        editingCampaign={editingCampaign}
      />

      {detailsCampaign && (
        <CampaignDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setDetailsCampaign(null)
            setIsDetailsModalOpen(false)
          }}
          campaign={detailsCampaign}
          onJoin={() => {}}
          isCreatorView
          canEdit={campaigns.find((c) => c.id === detailsCampaign.id)?.status === "draft"}
          onEdit={() => {
            const campaign = campaigns.find((c) => c.id === detailsCampaign.id)
            if (campaign) {
              setEditingCampaign(campaign)
              setIsDetailsModalOpen(false)
              setIsModalOpen(true)
            }
          }}
        />
      )}
    </div>
  )
}
