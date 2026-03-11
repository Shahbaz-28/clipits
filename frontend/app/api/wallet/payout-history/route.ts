import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthUser, isAuthError } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (isAuthError(auth)) return auth
  const userId = auth.userId

  try {
    const { data, error } = await supabaseAdmin
      .from("payout_requests")
      .select("id, amount, status, requested_at, processed_at, transaction_ref, admin_note")
      .eq("user_id", userId)
      .order("requested_at", { ascending: false })

    if (error) {
      console.error("[wallet/payout-history] error:", error)
      return NextResponse.json({ error: "Failed to load payout history" }, { status: 500 })
    }

    return NextResponse.json({ history: data ?? [] })
  } catch (err) {
    console.error("[wallet/payout-history] error:", err)
    return NextResponse.json({ error: "Failed to load payout history" }, { status: 500 })
  }
}
