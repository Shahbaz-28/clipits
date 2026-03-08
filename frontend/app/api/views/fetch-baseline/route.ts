import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { fetchReelViews } from "@/lib/socialkit"

export async function POST(req: NextRequest) {
  try {
    const { submissionId, reelUrl } = await req.json()
    if (!submissionId || !reelUrl) {
      return NextResponse.json({ error: "submissionId and reelUrl required" }, { status: 400 })
    }

    const stats = await fetchReelViews(reelUrl)
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
