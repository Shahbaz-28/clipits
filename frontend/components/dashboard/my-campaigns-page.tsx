"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Grid3X3, Loader2, CheckCircle, XCircle, Clock, Eye, Instagram } from "lucide-react"
import { CreateCampaignModal, type EditingCampaign } from "./create-campaign-modal"
import { CampaignDetailsModal } from "./campaign-details-modal"
import { mapCampaignRowToCard } from "@/lib/campaigns"
import type { CampaignCard, CampaignRow } from "@/lib/campaigns"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { authFetch } from "@/lib/api-client"

declare global {
  interface Window {
    Razorpay?: any
  }
}

interface MyCampaign extends EditingCampaign {
  category: string | null
  disclaimer: string | null
  status: "draft" | "pending_review" | "rejected" | "awaiting_payment" | "live" | "paused" | "completed"
  created_at: string
  thumbnail_url?: string | null
  campaign_spent?: number | null
  totalViews?: number
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

function myCampaignToCard(campaign: MyCampaign, totalViews = 0): CampaignCard {
  const row = {
    ...campaign,
    type: (campaign.type === "clipping" ? "clipping" : "ugc") as "ugc" | "clipping",
    flat_fee_bonus: 0,
    created_by: null,
    updated_at: campaign.created_at,
  } satisfies CampaignRow
  const card = mapCampaignRowToCard(row, { instagram: Instagram }, { totalViews })
  const spent = Number(campaign.campaign_spent ?? 0)
  const total = Number(campaign.total_budget) || 1
  const pct = Math.min(100, Math.round((spent / total) * 100))
  return {
    ...card,
    thumbnailUrl: campaign.thumbnail_url ?? null,
    earnings: `₹${spent.toLocaleString("en-IN")}`,
    percentage: `${pct}%`,
    progressPaidOut: spent,
    progressPercentage: pct,
    views: totalViews.toLocaleString("en-IN"),
  }
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
  const [activatingId, setActivatingId] = useState<string | null>(null)

  const fetchCampaigns = async () => {
    if (!user?.id) {
      setCampaigns([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [{ data: campaignData, error }, { data: submissions }] = await Promise.all([
        supabase
          .from("campaigns")
          .select("id, title, description, rate_per_1k, total_budget, min_payout, max_payout, category, type, status, created_at, requirements, assets, platforms, end_date, disclaimer, thumbnail_url, campaign_spent")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("submissions").select("campaign_id, view_count").eq("status", "approved"),
      ])

      if (error) {
        toast.error(error.message)
        setCampaigns([])
        return
      }
      const rows = (campaignData || []) as (MyCampaign & { requirements?: unknown; assets?: unknown; platforms?: unknown })[]
      const viewsByCampaign: Record<string, number> = {}
      for (const s of submissions ?? []) {
        const cid = (s as { campaign_id?: string }).campaign_id
        const v = Number((s as { view_count?: number }).view_count ?? 0)
        if (cid) viewsByCampaign[cid] = (viewsByCampaign[cid] ?? 0) + v
      }
      setCampaigns(
        normalizeCampaigns(rows).map((r) => ({ ...r, totalViews: viewsByCampaign[r.id] ?? 0 }))
      )
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
      draft: {
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: Clock,
        label: "Draft",
      },
      pending_review: {
        className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        icon: Clock,
        label: "Under review",
      },
      rejected: {
        className: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: XCircle,
        label: "Rejected",
      },
      awaiting_payment: {
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: Clock,
        label: "Awaiting payment",
      },
      live: {
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: CheckCircle,
        label: "Live",
      },
      paused: {
        className: "bg-rippl-black-3/50 text-rippl-gray border-rippl-black-3",
        icon: Clock,
        label: "Paused",
      },
      completed: {
        className: "bg-rippl-black-3/50 text-rippl-gray border-rippl-black-3",
        icon: CheckCircle,
        label: "Completed",
      },
    }
    const v =
      variants[status] || ({
        className: "bg-rippl-black-3/50 text-rippl-gray border-rippl-black-3",
        icon: Clock,
        label: status,
      } as const)
    const Icon = v.icon
    return (
      <Badge className={`${v.className} rounded-lg flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 border shadow-none`}>
        <Icon className="w-3 h-3" />
        {v.label}
      </Badge>
    )
  }

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (typeof window === "undefined") return resolve(false)
      if (window.Razorpay) return resolve(true)
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handleActivateCampaign = async (campaign: MyCampaign) => {
    if (!user?.id) {
      toast.error("You must be signed in to activate a campaign.")
      return
    }
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!keyId) {
      toast.error("Razorpay key is not configured.")
      return
    }
    setActivatingId(campaign.id)
    try {
      const ok = await loadRazorpayScript()
      if (!ok) {
        toast.error("Failed to load Razorpay. Check your internet connection.")
        return
      }

      const res = await authFetch("/api/razorpay/create-order", {
        method: "POST",
        body: JSON.stringify({ campaignId: campaign.id }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not start payment.")
        return
      }

      const options = {
        key: keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Rippl s",
        description: campaign.title,
        order_id: data.orderId,
        prefill: {
          email: (user as any)?.email ?? "",
        },
        theme: {
          color: "#FF4B4B",
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await authFetch("/api/razorpay/verify-payment", {
              method: "POST",
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                campaignId: campaign.id,
              }),
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok || verifyData.error) {
              toast.error(verifyData.error || "Payment verification failed.")
              return
            }
            toast.success("Payment successful. Your campaign is now live.")
            await refreshCampaigns()
          } catch (err) {
            console.error(err)
            toast.error("Payment verification failed. Please contact support if money was deducted.")
          }
        },
      }

      const razorpay = new window.Razorpay!(options)
      razorpay.open()
    } catch (err) {
      console.error(err)
      toast.error("Could not start Razorpay checkout. Please try again.")
    } finally {
      setActivatingId(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col space-y-8">
      {/* Header Section */}
      <div className="border-b border-rippl-black-3 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">My Campaigns</h1>
            <p className="text-rippl-gray font-medium text-base">
              Your central hub for creating and managing creator campaigns.
            </p>
          </div>
          <Button
            className="w-full sm:w-auto bg-rippl-violet text-white hover:bg-rippl-violet/90 shadow-lg shadow-rippl-violet/25 rounded-xl font-bold px-6 h-11 transition-all"
            onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Campaign list — same card layout as Explore; skeleton while loading */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="bg-rippl-black-2/50 border border-rippl-black-3 shadow-sm rounded-[32px] overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="mb-5 space-y-3">
                    <div className="h-6 w-3/4 bg-rippl-black-3 rounded-lg animate-pulse" />
                    <div className="h-6 w-20 bg-rippl-black-3 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-2 mb-5">
                    <div className="h-4 w-full bg-rippl-black-3 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-rippl-black-3 rounded animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-5 mt-8">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-16 bg-rippl-black-3 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {campaigns.map((campaign) => {
            const card = myCampaignToCard(campaign, campaign.totalViews ?? 0)
            return (
                <Card
                  key={campaign.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setDetailsCampaign(card)
                    setIsDetailsModalOpen(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setDetailsCampaign(card)
                      setIsDetailsModalOpen(true)
                    }
                  }}
                  className="bg-rippl-black-2/50 border border-rippl-black-3 shadow-md hover:border-rippl-violet transition-all duration-300 cursor-pointer group rounded-[32px] overflow-hidden"
                >
                  {card.thumbnailUrl && (
                    <div className="w-full h-32 bg-rippl-black-3 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.thumbnailUrl}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-white mb-2 group-hover:text-rippl-violet transition-colors text-lg line-clamp-2">
                          {card.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge
                            className="bg-rippl-violet text-white hover:bg-rippl-violet/90 text-xs shadow-sm shadow-rippl-violet/20 rounded-lg px-2 py-0.5 font-bold"
                          >
                            {card.rate}
                          </Badge>
                          {getStatusBadge(campaign.status)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-rippl-gray font-medium mb-5 h-10 line-clamp-2">
                      {card.description || "—"}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-xl font-extrabold text-rippl-violet">{card.earnings}</span>
                        <span className="text-xs font-bold text-rippl-gray/70">of {card.total} paid out</span>
                        <span className="text-sm font-extrabold text-white">{card.percentage}</span>
                      </div>
                      <div className="w-full bg-rippl-black-3 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-rippl-violet h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                          style={{ width: card.percentage }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs mt-4 pt-4 border-t border-rippl-black-3/50">
                      <div>
                        <p className="text-rippl-gray font-bold mb-1">Type</p>
                        <p className="font-extrabold text-white capitalize">{card.type}</p>
                      </div>
                      <div>
                        <p className="text-rippl-gray font-bold mb-1">Platforms</p>
                        <div className="flex space-x-1.5">
                          {card.platforms.map((Platform, idx) => (
                            <Platform key={`platform-${idx}`} className="w-4 h-4 text-white" />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-rippl-gray font-bold mb-1">Views</p>
                        <div className="flex items-center space-x-1.5">
                          <Eye className="w-4 h-4 text-white opacity-80" />
                          <span className="font-extrabold text-white">{card.views}</span>
                        </div>
                      </div>
                    </div>

                  {campaign.status === "awaiting_payment" && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          void handleActivateCampaign(campaign)
                        }}
                        disabled={activatingId === campaign.id}
                        className="bg-rippl-violet text-white hover:bg-rippl-violet/90 rounded-xl font-bold transition-all px-4"
                      >
                        {activatingId === campaign.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Activate & Pay"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* No Campaigns Yet Card */
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="bg-rippl-black-2 border border-rippl-black-3 w-full max-w-md p-8 text-center shadow-2xl rounded-[32px]">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <div className="w-20 h-20 bg-rippl-black-3 rounded-2xl flex items-center justify-center mb-6">
                <Grid3X3 className="w-10 h-10 text-rippl-gray" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-3">No campaigns yet</h2>
              <p className="text-base font-medium text-rippl-gray mb-8 max-w-sm">
                Create your first campaign to start earning and engaging with creators
              </p>
              <Button
                className="w-full sm:w-auto bg-rippl-violet text-white hover:bg-rippl-violet/90 shadow-lg shadow-rippl-violet/25 rounded-xl font-bold px-6 h-11 transition-all"
                onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }}
              >
                <Plus className="w-5 h-5 mr-2" />
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
