import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser, isAuthError } from "@/lib/api-auth"

const JOINABLE_STATUSES = ["live", "completed"]

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (isAuthError(auth)) return auth
  const userId = auth.userId

  try {
    const { campaignId } = (await req.json()) as { campaignId: string }

    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaignId" }, { status: 400 })
    }

    const { data: campaign, error: campaignErr } = await supabaseAdmin
      .from("campaigns")
      .select("id, status")
      .eq("id", campaignId)
      .single()

    if (campaignErr || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (!JOINABLE_STATUSES.includes(campaign.status)) {
      return NextResponse.json(
        { error: "This campaign is not open to join right now." },
        { status: 403 }
      )
    }

    const { error: insertErr } = await supabaseAdmin.from("user_campaigns").insert({
      user_id: userId,
      campaign_id: campaignId,
    })

    if (insertErr) {
      if (insertErr.code === "23505") {
        return NextResponse.json({ success: true, alreadyJoined: true })
      }
      console.error("[campaigns/join] insert error:", insertErr)
      return NextResponse.json({ error: "Failed to join campaign" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[campaigns/join] error:", err)
    return NextResponse.json({ error: "Failed to join campaign" }, { status: 500 })
  }
}
