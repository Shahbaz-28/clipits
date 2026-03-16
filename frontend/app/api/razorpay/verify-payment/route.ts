import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
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
    const { orderId, paymentId, signature, campaignId } = (await req.json()) as {
      orderId: string
      paymentId: string
      signature: string
      campaignId: string
    }

    if (!orderId || !paymentId || !signature || !campaignId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .select("id, status, created_by, razorpay_order_id, total_budget")
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
        { error: "Campaign is not awaiting payment" },
        { status: 400 },
      )
    }

    if (campaign.razorpay_order_id !== orderId) {
      return NextResponse.json({ error: "Order ID mismatch" }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex")

    if (expectedSignature !== signature) {
      console.error("[verify-payment] Signature mismatch for campaign:", campaignId)
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 })
    }

    const orderFromRazorpay = await razorpay.orders.fetch(orderId)
    const expectedAmountPaise = Math.round(Number(campaign.total_budget) * 100)
    if (orderFromRazorpay.amount !== expectedAmountPaise) {
      console.error("[verify-payment] Order amount mismatch for campaign:", campaignId)
      return NextResponse.json(
        { error: "Payment amount does not match campaign budget." },
        { status: 400 },
      )
    }

    const { error: updateErr } = await supabaseAdmin
      .from("campaigns")
      .update({
        status: "live",
        razorpay_payment_id: paymentId,
        amount_paid: Number(campaign.total_budget),
      })
      .eq("id", campaignId)

    if (updateErr) {
      console.error("[verify-payment] DB update error:", updateErr)
      return NextResponse.json({ error: "Payment verified but failed to activate campaign" }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: "live" })
  } catch (err) {
    console.error("[verify-payment] error:", err)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
