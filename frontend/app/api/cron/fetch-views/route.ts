import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { fetchReelViews } from "@/lib/socialkit"

const CRON_SECRET = process.env.CRON_SECRET ?? ""

function getCheckIntervalHours(approvedAt: string): number {
  const ageMs = Date.now() - new Date(approvedAt).getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  if (ageDays <= 3) return 6
  if (ageDays <= 14) return 12
  if (ageDays <= 30) return 24
  return 72
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: submissions, error } = await supabaseAdmin
    .from("submissions")
    .select(`
      id, content_link, baseline_views, latest_views, view_count, earnings, reviewed_at,
      campaigns!inner ( id, rate_per_1k, min_payout, max_payout, end_date )
    `)
    .eq("status", "approved")

  if (error) {
    console.error("[cron] query error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const now = new Date()
  let checked = 0
  let updated = 0
  let skipped = 0

  for (const sub of submissions || []) {
    const campaign = Array.isArray(sub.campaigns) ? sub.campaigns[0] : sub.campaigns
    if (!campaign) { skipped++; continue }

    if (campaign.end_date && new Date(campaign.end_date) < now) {
      skipped++
      continue
    }

    const currentEarnings = Number(sub.earnings) || 0
    const maxPayout = Number(campaign.max_payout) || Infinity
    if (currentEarnings >= maxPayout) {
      skipped++
      continue
    }

    const intervalHours = getCheckIntervalHours(sub.reviewed_at || now.toISOString())

    const { data: lastSnapshot } = await supabaseAdmin
      .from("view_snapshots")
      .select("captured_at")
      .eq("submission_id", sub.id)
      .order("captured_at", { ascending: false })
      .limit(1)
      .single()

    if (lastSnapshot?.captured_at) {
      const hoursSinceLast = (now.getTime() - new Date(lastSnapshot.captured_at).getTime()) / (1000 * 60 * 60)
      if (hoursSinceLast < intervalHours) {
        skipped++
        continue
      }
    }

    const stats = await fetchReelViews(sub.content_link)
    checked++

    if (!stats) continue

    if (stats.views < (sub.latest_views || 0)) continue

    await supabaseAdmin
      .from("view_snapshots")
      .insert({ submission_id: sub.id, views: stats.views })

    const viewsGained = Math.max(0, stats.views - (sub.baseline_views || 0))
    const ratePer1k = Number(campaign.rate_per_1k) || 0
    const minPayout = Number(campaign.min_payout) || 0
    const rawEarnings = (viewsGained / 1000) * ratePer1k
    const clampedEarnings = Math.max(minPayout, Math.min(maxPayout, rawEarnings))
    const finalEarnings = Math.round(clampedEarnings * 100) / 100

    await supabaseAdmin
      .from("submissions")
      .update({
        latest_views: stats.views,
        view_count: viewsGained,
        earnings: finalEarnings,
      })
      .eq("id", sub.id)

    updated++

    await new Promise((r) => setTimeout(r, 800))
  }

  return NextResponse.json({
    success: true,
    total: (submissions || []).length,
    checked,
    updated,
    skipped,
    timestamp: now.toISOString(),
  })
}
