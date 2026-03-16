import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthAdmin, isAuthError } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const auth = await getAuthAdmin(req)
  if (isAuthError(auth)) return auth

  try {
    const { requestId, transactionRef } = (await req.json()) as {
      requestId: string
      transactionRef?: string
    }

    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 })
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("payout_requests")
      .select("id, user_id, amount, status")
      .eq("id", requestId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Payout request not found" }, { status: 404 })
    }

    if (existing.status === "paid") {
      return NextResponse.json({ error: "Payout request is already marked as paid" }, { status: 400 })
    }
    if (existing.status === "rejected") {
      return NextResponse.json({ error: "Cannot mark a rejected request as paid." }, { status: 400 })
    }

    const userId = (existing as { user_id: string }).user_id
    const requestAmount = Number((existing as { amount: number }).amount ?? 0)

    const [{ data: earnedRows }, { data: paidRows }] = await Promise.all([
      supabaseAdmin.from("submissions").select("earnings").eq("user_id", userId).eq("status", "approved"),
      supabaseAdmin.from("payout_requests").select("amount, status").eq("user_id", userId),
    ])

    const totalEarned =
      earnedRows?.reduce((sum, row) => sum + Number((row as { earnings?: number }).earnings ?? 0), 0) ?? 0
    let totalPaid = 0
    for (const row of paidRows ?? []) {
      const amt = Number((row as { amount?: number }).amount ?? 0)
      if ((row as { status?: string }).status === "paid") totalPaid += amt
    }

    if (totalEarned < totalPaid + requestAmount) {
      return NextResponse.json(
        {
          error:
            "User earnings do not cover this payout amount. Do not mark as paid if the clipper was not actually paid.",
        },
        { status: 400 },
      )
    }

    const { error: updateError } = await supabaseAdmin
      .from("payout_requests")
      .update({
        status: "paid",
        processed_at: new Date().toISOString(),
        transaction_ref: transactionRef ?? null,
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("[admin/payout-requests/pay] update error:", updateError)
      return NextResponse.json({ error: "Failed to update payout request" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[admin/payout-requests/pay] error:", err)
    return NextResponse.json({ error: "Failed to mark payout as paid" }, { status: 500 })
  }
}
