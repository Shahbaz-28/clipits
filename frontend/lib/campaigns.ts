import type React from "react"

/**
 * Campaign row from Supabase (public.campaigns).
 * Use mapCampaignRowToCard() to get the shape expected by CampaignDetailsModal / JoinedCampaignPage.
 */
export interface CampaignRow {
  id: string
  title: string
  description: string | null
  type: "ugc" | "clipping"
  category: string | null
  total_budget: number
  rate_per_1k: number
  min_payout: number
  max_payout: number
  flat_fee_bonus: number
  platforms: string[]
  requirements: string[]
  assets: { name: string; link: string }[]
  disclaimer: string | null
  status: string
  created_by: string | null
  created_at: string
  updated_at: string
  end_date: string | null
}

export interface CampaignCard {
  id: string
  title: string
  description: string
  earnings: string
  total: string
  percentage: string
  rate: string
  type: string
  platforms: React.ComponentType<{ className?: string; key?: string }>[]
  views: string
  color: string
  progressPaidOut: number
  totalBudgetDetail: number
  progressPercentage: number
  daysLeft: number
  minPayout: number
  maxPayout: number
  category: string
  requirements: string[]
  assets: { name: string; link: string }[]
  disclaimer: string
}

/**
 * Map DB campaign row to the card/modal shape.
 * Pass in platform icon components so we don't import Lucide in lib.
 */
export function mapCampaignRowToCard(
  row: CampaignRow,
  platformIcons: { instagram: React.ComponentType<{ className?: string }> }
): CampaignCard {
  const platforms = (row.platforms?.length ? row.platforms : ["instagram"]).includes("instagram")
    ? [platformIcons.instagram]
    : [platformIcons.instagram]
  const typeLabel = row.type === "ugc" ? "UGC" : "Clipping"
  const endDate = row.end_date ? new Date(row.end_date) : null
  const daysLeft = endDate
    ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    earnings: "₹0",
    total: `₹${Number(row.total_budget).toLocaleString("en-IN")}`,
    percentage: "0%",
    rate: `₹${Number(row.rate_per_1k).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / 1K`,
    type: typeLabel,
    platforms,
    views: "0",
    color: "bg-vibrant-red-orange",
    progressPaidOut: 0,
    totalBudgetDetail: Number(row.total_budget),
    progressPercentage: 0,
    daysLeft,
    minPayout: Number(row.min_payout),
    maxPayout: Number(row.max_payout),
    category: row.category ?? "",
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    assets: Array.isArray(row.assets) ? row.assets : [],
    disclaimer: row.disclaimer ?? "",
  }
}
