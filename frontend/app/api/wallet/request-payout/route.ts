import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser, isAuthError } from "@/lib/api-auth"
import { checkRateLimit } from "@/lib/rate-limit"

const MIN_WITHDRAWAL = 2000

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (isAuthError(auth)) return auth
  const userId = auth.userId
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const allowed = checkRateLimit(`wallet-request-payout:${userId}:${ip}`, 3, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many payout requests. Please wait a minute and try again." }, { status: 429 })
  }

  try {
    const { amount } = (await req.json()) as { amount: number }
    if (!amount) {
      return NextResponse.json({ error: "Missing amount" }, { status: 400 })
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

    const [
      { data: earnedRows, error: earningsError },
      { data: payoutRows, error: payoutError },
      { data: payoutDetails, error: detailsError },
    ] = await Promise.all([
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

    if (pendingWithdrawal > 0) {
      return NextResponse.json(
        { error: "You already have a pending payout request. Please wait until it is processed." },
        { status: 400 },
      )
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

    const { data: payoutRowsRecheck, error: payoutRecheckError } = await supabaseAdmin
      .from("payout_requests")
      .select("amount, status")
      .eq("user_id", userId)

    if (!payoutRecheckError && payoutRowsRecheck) {
      let totalPaidRecheck = 0
      let pendingRecheck = 0
      for (const row of payoutRowsRecheck) {
        const amt = Number((row as { amount?: number }).amount ?? 0)
        const st = (row as { status?: string }).status
        if (st === "paid") totalPaidRecheck += amt
        else if (st === "pending" || st === "processing") pendingRecheck += amt
      }
      if (pendingRecheck > 0) {
        return NextResponse.json(
          { error: "You already have a pending payout request. Please wait until it is processed." },
          { status: 400 },
        )
      }
      const availableRecheck = Math.max(0, totalEarned - totalPaidRecheck - pendingRecheck)
      if (requestedAmount > availableRecheck) {
        return NextResponse.json(
          { error: `Balance changed. You can request up to ₹${availableRecheck.toLocaleString("en-IN")}.` },
          { status: 400 },
        )
      }
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
