import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

const MIN_WITHDRAWAL = 2000

export async function POST(req: NextRequest) {
  try {
    const { userId, amount } = (await req.json()) as { userId: string; amount: number }
    if (!userId || !amount) {
      return NextResponse.json({ error: "Missing userId or amount" }, { status: 400 })
    }

    const requestedAmount = Number(amount)
    if (Number.isNaN(requestedAmount) || requestedAmount <= 0) {
      return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 })
    }
    if (requestedAmount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL.toLocaleString("en-IN")}` },
        { status: 400 },
      )
    }

    const [{ data: earnedRows, error: earningsError }, { data: payoutRows, error: payoutError }, { data: payoutDetails, error: detailsError }] =
      await Promise.all([
        supabaseAdmin.from("submissions").select("earnings").eq("user_id", userId).eq("status", "approved"),
        supabaseAdmin.from("payout_requests").select("amount, status").eq("user_id", userId),
        supabaseAdmin
          .from("payout_details")
          .select("id, is_default")
          .eq("user_id", userId)
          .order("created_at", { ascending: true }),
      ])

    if (earningsError) {
      console.error("[wallet/request-payout] earnings error:", earningsError)
      return NextResponse.json({ error: "Could not verify earnings" }, { status: 500 })
    }
    if (payoutError) {
      console.error("[wallet/request-payout] payout error:", payoutError)
      return NextResponse.json({ error: "Could not verify existing payouts" }, { status: 500 })
    }
    if (detailsError) {
      console.error("[wallet/request-payout] payout details error:", detailsError)
      return NextResponse.json({ error: "Could not verify payout details" }, { status: 500 })
    }

    const totalEarned =
      earnedRows?.reduce((sum, row) => sum + Number((row as { earnings?: number }).earnings ?? 0), 0) ?? 0

    let totalPaid = 0
    let pendingWithdrawal = 0
    for (const row of payoutRows ?? []) {
      const { amount: amtRaw, status } = row as { amount?: number; status?: string }
      const amt = Number(amtRaw ?? 0)
      if (status === "paid") {
        totalPaid += amt
      } else if (status === "pending" || status === "processing") {
        pendingWithdrawal += amt
      }
    }

    const availableBalance = Math.max(0, totalEarned - totalPaid - pendingWithdrawal)

    if (requestedAmount > availableBalance) {
      return NextResponse.json(
        {
          error: `You can request up to ₹${availableBalance.toLocaleString("en-IN")}.`,
        },
        { status: 400 },
      )
    }

    const defaultDetail =
      payoutDetails?.find((d) => (d as { is_default: boolean }).is_default) ??
      (payoutDetails && payoutDetails[0]) ??
      null

    if (!defaultDetail) {
      return NextResponse.json(
        { error: "Add your UPI ID in payout details before requesting a payout." },
        { status: 400 },
      )
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("payout_requests")
      .insert({
        user_id: userId,
        amount: requestedAmount,
        status: "pending",
        payout_detail_id: (defaultDetail as { id: string }).id,
      })
      .select("id, amount, status, requested_at")
      .single()

    if (insertError) {
      console.error("[wallet/request-payout] insert error:", insertError)
      return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      request: inserted,
      availableBalance: availableBalance - requestedAmount,
    })
  } catch (err) {
    console.error("[wallet/request-payout] error:", err)
    return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 })
  }
}

