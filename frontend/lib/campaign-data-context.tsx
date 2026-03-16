"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth } from "./auth-context"
import { supabase } from "./supabase"

interface CampaignDataContextType {
  prefetchedCampaigns: unknown[] | null
  prefetchCampaignsLoading: boolean
  refreshCreatorCampaigns: () => Promise<void>
}

const CampaignDataContext = createContext<CampaignDataContextType>({
  prefetchedCampaigns: null,
  prefetchCampaignsLoading: false,
  refreshCreatorCampaigns: async () => {},
})

function normalizeRow(row: Record<string, unknown>) {
  return {
    ...row,
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    assets: Array.isArray(row.assets) ? row.assets : [],
    platforms: Array.isArray(row.platforms) ? row.platforms : ["instagram"],
  }
}

export function CampaignDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [prefetchedCampaigns, setPrefetchedCampaigns] = useState<unknown[] | null>(null)
  const [prefetchCampaignsLoading, setPrefetchCampaignsLoading] = useState(false)

  const fetchCreatorCampaigns = useCallback(async () => {
    if (!user?.id) return
    setPrefetchCampaignsLoading(true)
    try {
      const [{ data, error }, { data: submissions }] = await Promise.all([
        supabase
          .from("campaigns")
          .select(
            "id, title, description, rate_per_1k, total_budget, min_payout, max_payout, category, type, status, created_at, requirements, assets, platforms, end_date, thumbnail_url, campaign_spent",
          )
          .eq("created_by", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("submissions").select("campaign_id, view_count").eq("status", "approved"),
      ])

      if (!error && data) {
        const rows = data as (Record<string, unknown> & { id?: string })[]
        const viewsByCampaign: Record<string, number> = {}
        for (const s of submissions ?? []) {
          const cid = (s as { campaign_id?: string }).campaign_id
          const v = Number((s as { view_count?: number }).view_count ?? 0)
          if (cid) viewsByCampaign[cid] = (viewsByCampaign[cid] ?? 0) + v
        }
        setPrefetchedCampaigns(
          rows.map((row) =>
            normalizeRow({
              ...row,
              totalViews: row.id ? viewsByCampaign[row.id] ?? 0 : 0,
            }),
          ),
        )
      } else {
        setPrefetchedCampaigns([])
      }
    } catch {
      setPrefetchedCampaigns([])
    } finally {
      setPrefetchCampaignsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchCreatorCampaigns()
    } else {
      setPrefetchedCampaigns(null)
      setPrefetchCampaignsLoading(false)
    }
  }, [user?.id, fetchCreatorCampaigns])

  return (
    <CampaignDataContext.Provider
      value={{
        prefetchedCampaigns,
        prefetchCampaignsLoading,
        refreshCreatorCampaigns: fetchCreatorCampaigns,
      }}
    >
      {children}
    </CampaignDataContext.Provider>
  )
}

export function useCampaignData() {
  const context = useContext(CampaignDataContext)
  if (context === undefined) {
    throw new Error("useCampaignData must be used within a CampaignDataProvider")
  }
  return context
}
