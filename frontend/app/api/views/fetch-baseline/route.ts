import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { fetchReelViews } from "@/lib/socialkit"
import { getAuthUser, isAuthError } from "@/lib/api-auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (isAuthError(auth)) return auth
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const allowed = checkRateLimit(`views-fetch-baseline:${auth.userId}:${ip}`, 8, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many baseline requests. Please wait and try again." }, { status: 429 })
  }

  try {
    const { submissionId, reelUrl } = await req.json()
    if (!submissionId || !reelUrl) {
      return NextResponse.json({ error: "submissionId and reelUrl required" }, { status: 400 })
    }

    const { data: sub, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("id, user_id, content_link, baseline_views, latest_views")
      .eq("id", submissionId)
      .single()

    if (subError || !sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
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

    const normalizeLink = (raw: string) =>
      (raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`).replace(/\/+$/, "")
    const submissionLink = normalizeLink((sub as { content_link?: string }).content_link ?? "")
    const requestedLink = normalizeLink(String(reelUrl))
    if (submissionLink !== requestedLink) {
      return NextResponse.json(
        { error: "Reel URL must match the submission's content link." },
        { status: 400 }
      )
    }

    const baselineExists = sub.baseline_views !== null && sub.baseline_views !== undefined
    if (baselineExists) {
      const baselineViews = Number(sub.baseline_views ?? 0)

      // Ensure we have at least one snapshot for interval gating.
      const { data: existingSnapshot } = await supabaseAdmin
        .from("view_snapshots")
        .select("id")
        .eq("submission_id", submissionId)
        .order("captured_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!existingSnapshot) {
        const { error: snapError } = await supabaseAdmin.from("view_snapshots").insert({
          submission_id: submissionId,
          views: baselineViews,
        })
        if (snapError) {
          console.error("[fetch-baseline] snapshot insert error:", snapError)
        }
      }

      // Baseline was already captured during submission; keep DB values.
      const { error: updateError } = await supabaseAdmin
        .from("submissions")
        .update({ baseline_views: baselineViews, latest_views: baselineViews, view_count: 0, earnings: 0 })
        .eq("id", submissionId)
      if (updateError) {
        console.error("[fetch-baseline] submission update error:", updateError)
      }

      return NextResponse.json({
        success: true,
        views: baselineViews,
        fromApi: false,
      })
    }

    const stats = await fetchReelViews(requestedLink)
    const baselineViews = stats?.views ?? 0

    const { error: snapError } = await supabaseAdmin
      .from("view_snapshots")
      .insert({ submission_id: submissionId, views: baselineViews })
    if (snapError) {
      console.error("[fetch-baseline] snapshot insert error:", snapError)
    }

    const { error: updateError } = await supabaseAdmin
      .from("submissions")
      .update({ baseline_views: baselineViews, latest_views: baselineViews })
      .eq("id", submissionId)
    if (updateError) {
      console.error("[fetch-baseline] submission update error:", updateError)
    }

    return NextResponse.json({
      success: true,
      views: baselineViews,
      fromApi: stats !== null,
    })
  } catch (err) {
    console.error("[fetch-baseline] error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
