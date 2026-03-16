import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser, isAuthError } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (isAuthError(auth)) return auth
  const userId = auth.userId

  try {
    const [{ data: earnedRows, error: earningsError }, { data: payoutRows, error: payoutError }] =
      await Promise.all([
        supabaseAdmin.from("submissions").select("earnings").eq("user_id", userId).eq("status", "approved"),
        supabaseAdmin.from("payout_requests").select("amount, status").eq("user_id", userId),
      ])

    if (earningsError) {
      console.error("[wallet/balance] earnings error:", earningsError)
      return NextResponse.json({ error: "Could not load earnings" }, { status: 500 })
    }
    if (payoutError) {
      console.error("[wallet/balance] payout error:", payoutError)
      return NextResponse.json({ error: "Could not load payout history" }, { status: 500 })
    }

    const totalEarned =
      earnedRows?.reduce((sum, row) => sum + Number((row as { earnings?: number }).earnings ?? 0), 0) ?? 0

    let totalPaid = 0
    let pendingWithdrawal = 0
    for (const row of payoutRows ?? []) {
      const { amount, status } = row as { amount?: number; status?: string }
      const amt = Number(amount ?? 0)
      if (status === "paid") {
        totalPaid += amt
      } else if (status === "pending" || status === "processing") {
        pendingWithdrawal += amt
      }
    }

    const availableBalance = Math.max(0, totalEarned - totalPaid - pendingWithdrawal)

    return NextResponse.json({
      totalEarned,
      totalPaid,
      pendingWithdrawal,
      availableBalance,
    })
  } catch (err) {
    console.error("[wallet/balance] error:", err)
    return NextResponse.json({ error: "Failed to load wallet balance" }, { status: 500 })
  }
}
