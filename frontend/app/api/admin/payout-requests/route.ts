import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthAdmin, isAuthError } from "@/lib/api-auth"

export async function GET(req: NextRequest) {
  const auth = await getAuthAdmin(req)
  if (isAuthError(auth)) return auth

  try {
    const { data, error } = await supabaseAdmin
      .from("payout_requests")
      .select(
        `
        id,
        amount,
        status,
        requested_at,
        processed_at,
        transaction_ref,
        admin_note,
        users!payout_requests_user_id_fkey (
          first_name,
          last_name,
          email,
          role
        ),
        payout_details!payout_requests_payout_detail_id_fkey (
          upi_id
        )
      `,
      )
      .order("requested_at", { ascending: false })

    if (error) {
      console.error("[admin/payout-requests] list error:", error)
      return NextResponse.json({ error: "Failed to load payout requests" }, { status: 500 })
    }

    return NextResponse.json({ requests: data ?? [] })
  } catch (err) {
    console.error("[admin/payout-requests] error:", err)
    return NextResponse.json({ error: "Failed to load payout requests" }, { status: 500 })
  }
}
