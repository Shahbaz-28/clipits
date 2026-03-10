import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { fetchInstagramProfile } from "@/lib/socialkit"

export async function POST(req: NextRequest) {
  try {
    const { userId, username, code } = (await req.json()) as {
      userId: string
      username: string
      code: string
    }

    if (!userId || !username || !code) {
      return NextResponse.json(
        { verified: false, error: "Missing required fields." },
        { status: 400 }
      )
    }

    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .select("instagram_verification_code")
      .eq("id", userId)
      .single()

    if (userErr || !user) {
      return NextResponse.json(
        { verified: false, error: "User not found." },
        { status: 404 }
      )
    }

    if (user.instagram_verification_code !== code) {
      return NextResponse.json(
        { verified: false, error: "Verification code mismatch. Please restart verification." },
        { status: 400 }
      )
    }

    const profileUrl = `https://www.instagram.com/${username}/`
    const profile = await fetchInstagramProfile(profileUrl)

    if (!profile) {
      return NextResponse.json(
        {
          verified: false,
          error: "Could not fetch your Instagram profile. Make sure your account is public and try again.",
        },
        { status: 422 }
      )
    }

    if (!profile.bio.includes(code)) {
      return NextResponse.json(
        {
          verified: false,
          error: "Verification code not found in your bio. Make sure you saved the exact code and try again.",
        },
        { status: 200 }
      )
    }

    const { error: updateErr } = await supabaseAdmin
      .from("users")
      .update({
        instagram_verified_at: new Date().toISOString(),
        instagram_username: profile.username || username,
        instagram_verification_code: null,
      })
      .eq("id", userId)

    if (updateErr) {
      console.error("[verify-bio] DB update error:", updateErr)
      return NextResponse.json(
        { verified: false, error: "Failed to update verification status." },
        { status: 500 }
      )
    }

    return NextResponse.json({ verified: true, username: profile.username || username })
  } catch (err) {
    console.error("[verify-bio] unexpected error:", err)
    return NextResponse.json(
      { verified: false, error: "Internal server error." },
      { status: 500 }
    )
  }
}
