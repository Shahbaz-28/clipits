import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAuthAdmin, isAuthError } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const auth = await getAuthAdmin(req)
  if (isAuthError(auth)) return auth

  try {
    const { requestId, adminNote } = (await req.json()) as {
      requestId: string
      adminNote?: string
    }

    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 })
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("payout_requests")
      .select("id, status")
      .eq("id", requestId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Payout request not found" }, { status: 404 })
    }

    if (existing.status === "paid") {
      return NextResponse.json({ error: "Cannot reject an already paid request" }, { status: 400 })
    }

    const { error: updateError } = await supabaseAdmin
      .from("payout_requests")
      .update({
        status: "rejected",
        processed_at: new Date().toISOString(),
        admin_note: adminNote ?? null,
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("[admin/payout-requests/reject] update error:", updateError)
      return NextResponse.json({ error: "Failed to update payout request" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[admin/payout-requests/reject] error:", err)
    return NextResponse.json({ error: "Failed to reject payout request" }, { status: 500 })
  }
}
