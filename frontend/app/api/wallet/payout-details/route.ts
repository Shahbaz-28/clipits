import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("payout_details")
      .select("id, method, upi_id, is_default")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[wallet/payout-details] get error:", error)
      return NextResponse.json({ error: "Failed to load payout details" }, { status: 500 })
    }

    const defaultDetail = (data || []).find((d) => d.is_default) ?? (data || [])[0] ?? null
    return NextResponse.json({ details: data ?? [], defaultDetail })
  } catch (err) {
    console.error("[wallet/payout-details] error:", err)
    return NextResponse.json({ error: "Failed to load payout details" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, upiId } = (await req.json()) as { userId: string; upiId: string }
    if (!userId || !upiId) {
      return NextResponse.json({ error: "Missing userId or upiId" }, { status: 400 })
    }

    const trimmedUpi = upiId.trim()
    if (!trimmedUpi || !trimmedUpi.includes("@")) {
      return NextResponse.json({ error: "Enter a valid UPI ID" }, { status: 400 })
    }

    await supabaseAdmin
      .from("payout_details")
      .update({ is_default: false })
      .eq("user_id", userId)

    const { data, error } = await supabaseAdmin
      .from("payout_details")
      .insert({
        user_id: userId,
        method: "upi",
        upi_id: trimmedUpi,
        is_default: true,
      })
      .select("id, method, upi_id, is_default")
      .single()

    if (error) {
      console.error("[wallet/payout-details] save error:", error)
      return NextResponse.json({ error: "Failed to save payout details" }, { status: 500 })
    }

    return NextResponse.json({ detail: data })
  } catch (err) {
    console.error("[wallet/payout-details] error:", err)
    return NextResponse.json({ error: "Failed to save payout details" }, { status: 500 })
  }
}

