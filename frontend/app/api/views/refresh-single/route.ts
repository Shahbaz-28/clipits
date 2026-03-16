import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { fetchReelViews } from "@/lib/socialkit"
import { getAuthUser, isAuthError } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (isAuthError(auth)) return auth

  try {
    const { submissionId } = (await req.json()) as { submissionId: string }

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId required" }, { status: 400 })
    }

    const { data: sub, error } = await supabaseAdmin
      .from("submissions")
      .select(
        `
        id, user_id, campaign_id, content_link, baseline_views, latest_views, view_count, earnings, status,
        campaigns!inner ( id, rate_per_1k, min_payout, max_payout, end_date, campaign_spent, amount_paid, status )
      `,
      )
      .eq("id", submissionId)
      .single()

    if (error || !sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    if ((sub as { status?: string }).status !== "approved") {
      return NextResponse.json(
        { error: "Only approved submissions can have views refreshed." },
        { status: 400 },
      )
    }

    if (sub.user_id !== auth.userId) {
      const { data: profile } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", auth.userId)
        .single()
      if (!profile || profile.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const campaign = Array.isArray(sub.campaigns) ? sub.campaigns[0] : sub.campaigns
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found for submission" }, { status: 404 })
    }

    if (campaign.end_date && new Date(campaign.end_date) < new Date()) {
      return NextResponse.json(
        { error: "Campaign has ended. Views are no longer tracked." },
        { status: 400 },
      )
    }

    const stats = await fetchReelViews(sub.content_link)
    if (!stats) {
      return NextResponse.json(
        {
          error:
            "Could not fetch views from Instagram. Make sure the reel link is correct and the reel is public.",
        },
        { status: 422 },
      )
    }

    if (stats.views < (sub.latest_views || 0)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "New view count is lower than the last recorded value.",
      })
    }

    await supabaseAdmin
      .from("view_snapshots")
      .insert({ submission_id: sub.id, views: stats.views })

    const baseline = sub.baseline_views ?? 0
    const hasNoBaseline = baseline === 0 && stats.views > 0

    let viewsGained: number
    let finalEarnings: number

    if (hasNoBaseline) {
      viewsGained = 0
      finalEarnings = 0
      await supabaseAdmin
        .from("submissions")
        .update({
          baseline_views: stats.views,
          latest_views: stats.views,
          view_count: 0,
          earnings: 0,
        })
        .eq("id", sub.id)
    } else {
      viewsGained = Math.max(0, stats.views - baseline)
      const ratePer1k = Number(campaign.rate_per_1k) || 0
      const minPayout = Number(campaign.min_payout) || 0
      const maxPayout = Number(campaign.max_payout) || Infinity
      const rawEarnings = (viewsGained / 1000) * ratePer1k
      const clampedEarnings = Math.max(minPayout, Math.min(maxPayout, rawEarnings))
      finalEarnings = Math.round(clampedEarnings * 100) / 100

      await supabaseAdmin
        .from("submissions")
        .update({
          latest_views: stats.views,
          view_count: viewsGained,
          earnings: finalEarnings,
        })
        .eq("id", sub.id)
    }

    const delta = finalEarnings - (Number(sub.earnings) || 0)
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

    return NextResponse.json({
      success: true,
      skipped: false,
      views: stats.views,
      viewsGained,
      earnings: finalEarnings,
    })
  } catch (err) {
    console.error("[refresh-single] error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
