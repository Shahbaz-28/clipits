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
      id, user_id, campaign_id, content_link, baseline_views, latest_views, view_count, earnings, reviewed_at,
      campaigns!inner ( id, rate_per_1k, min_payout, max_payout, end_date, campaign_spent, amount_paid, status )
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
    if (!campaign) {
      skipped++
      continue
    }

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

    const baseline = sub.baseline_views ?? 0
    // Treat "missing baseline" as NULL/undefined, not as numeric 0.
    const hasNoBaseline = sub.baseline_views === null || sub.baseline_views === undefined
      ? stats.views > 0
      : false

    let viewsGained: number
    let finalEarnings: number

    let submissionUpdated = false

    if (hasNoBaseline) {
      viewsGained = 0
      finalEarnings = 0
      let updateQuery = supabaseAdmin
        .from("submissions")
        .update({
          baseline_views: stats.views,
          latest_views: stats.views,
          view_count: 0,
          earnings: 0,
        })
        .eq("id", sub.id)
        .eq("earnings", currentEarnings)

      if (sub.latest_views === null || sub.latest_views === undefined) {
        updateQuery = updateQuery.is("latest_views", null)
      } else {
        updateQuery = updateQuery.eq("latest_views", Number(sub.latest_views) || 0)
      }

      const { data: updatedRows, error: subUpdateError } = await updateQuery.select("id").limit(1)
      if (subUpdateError) {
        console.error("[cron] submission update error:", subUpdateError)
        skipped++
        continue
      }
      submissionUpdated = (updatedRows?.length ?? 0) > 0
    } else {
      viewsGained = Math.max(0, stats.views - baseline)
      const ratePer1k = Number(campaign.rate_per_1k) || 0
      const minPayout = Number(campaign.min_payout) || 0
      const rawEarnings = (viewsGained / 1000) * ratePer1k
      const clampedEarnings = Math.max(minPayout, Math.min(maxPayout, rawEarnings))
      finalEarnings = Math.round(clampedEarnings * 100) / 100

      let updateQuery = supabaseAdmin
        .from("submissions")
        .update({
          latest_views: stats.views,
          view_count: viewsGained,
          earnings: finalEarnings,
        })
        .eq("id", sub.id)
        .eq("earnings", currentEarnings)

      if (sub.latest_views === null || sub.latest_views === undefined) {
        updateQuery = updateQuery.is("latest_views", null)
      } else {
        updateQuery = updateQuery.eq("latest_views", Number(sub.latest_views) || 0)
      }

      const { data: updatedRows, error: subUpdateError } = await updateQuery.select("id").limit(1)
      if (subUpdateError) {
        console.error("[cron] submission update error:", subUpdateError)
        skipped++
        continue
      }
      submissionUpdated = (updatedRows?.length ?? 0) > 0
    }

    if (!submissionUpdated) {
      // Another worker/request already updated this row; avoid double-counting campaign_spent.
      skipped++
      continue
    }

    const delta = finalEarnings - currentEarnings
    if (delta > 0) {
      const newCampaignSpent = Number(campaign.campaign_spent || 0) + delta
      const updates: Record<string, unknown> = {
        campaign_spent: newCampaignSpent,
      }
      const amountPaid = Number(campaign.amount_paid || 0)
      if (amountPaid > 0 && newCampaignSpent >= amountPaid && campaign.status !== "completed") {
        updates.status = "completed"
      }
      await supabaseAdmin.from("campaigns").update(updates).eq("id", campaign.id)
    }

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
