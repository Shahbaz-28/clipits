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
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, description, rate_per_1k, total_budget, category, type, status, created_at, requirements, assets, platforms, end_date, thumbnail_url")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
      if (!error && data) {
        const rows = data as Record<string, unknown>[]
        setPrefetchedCampaigns(rows.map(normalizeRow))
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
