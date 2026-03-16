import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { fetchReelViews } from "@/lib/socialkit"
import { getAuthUser, isAuthError } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (isAuthError(auth)) return auth

  try {
    const { submissionId, reelUrl } = await req.json()
    if (!submissionId || !reelUrl) {
      return NextResponse.json({ error: "submissionId and reelUrl required" }, { status: 400 })
    }

    const { data: sub, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("id, user_id, content_link")
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
