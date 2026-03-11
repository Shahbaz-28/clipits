import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser, isAuthError } from "@/lib/api-auth"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (isAuthError(auth)) return auth
  const userId = auth.userId

  try {
    const { campaignId } = (await req.json()) as { campaignId: string }

    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaignId" }, { status: 400 })
    }

    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .select("id, title, total_budget, status, created_by")
      .eq("id", campaignId)
      .single()

    if (error || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.created_by !== userId) {
      return NextResponse.json({ error: "You are not the owner of this campaign" }, { status: 403 })
    }

    if (campaign.status !== "awaiting_payment") {
      return NextResponse.json(
        { error: `Campaign is in "${campaign.status}" state. Payment is only allowed for approved campaigns.` },
        { status: 400 },
      )
    }

    const amountInPaise = Math.round(Number(campaign.total_budget) * 100)
    if (amountInPaise <= 0) {
      return NextResponse.json({ error: "Campaign budget must be greater than 0" }, { status: 400 })
    }

    const shortId = campaignId.replace(/-/g, "").slice(0, 24)
    const receipt = `cmp_${shortId}`

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        campaignId,
        campaignTitle: campaign.title,
        userId,
      },
    })

    await supabaseAdmin
      .from("campaigns")
      .update({ razorpay_order_id: order.id })
      .eq("id", campaignId)

    return NextResponse.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      campaignTitle: campaign.title,
    })
  } catch (err) {
    console.error("[create-order] error:", err)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
