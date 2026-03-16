import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { fetchInstagramProfile } from "@/lib/socialkit"
import { getAuthUser, isAuthError } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (isAuthError(auth)) return auth
  const userId = auth.userId

  try {
    const { username, code, accountId } = (await req.json()) as {
      username: string
      code: string
      accountId: string
    }

    if (!username || !code || !accountId) {
      return NextResponse.json(
        { verified: false, error: "Missing required fields." },
        { status: 400 }
      )
    }

    const { data: account, error: accErr } = await supabaseAdmin
      .from("user_instagram_accounts")
      .select("verification_code, user_id, username")
      .eq("id", accountId)
      .single()

    if (accErr || !account) {
      return NextResponse.json(
        { verified: false, error: "Instagram account record not found." },
        { status: 404 }
      )
    }

    if (account.user_id !== userId) {
      return NextResponse.json(
        { verified: false, error: "Unauthorized." },
        { status: 403 }
      )
    }

    if (account.verification_code !== code) {
      return NextResponse.json(
        { verified: false, error: "Verification code mismatch. Please restart verification." },
        { status: 400 }
      )
    }

    const usernameToFetch = (account.username || username).trim().replace(/^@/, "")
    if (!usernameToFetch) {
      return NextResponse.json(
        { verified: false, error: "Account username missing. Please restart verification." },
        { status: 400 }
      )
    }
    const profileUrl = `https://www.instagram.com/${usernameToFetch}/`
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

    const resolvedUsername = profile.username || username

    const { error: updateErr } = await supabaseAdmin
      .from("user_instagram_accounts")
      .update({
        verified_at: new Date().toISOString(),
        username: resolvedUsername,
        verification_code: null,
      })
      .eq("id", accountId)

    if (updateErr) {
      console.error("[verify-bio] DB update error:", updateErr)
      return NextResponse.json(
        { verified: false, error: "Failed to update verification status." },
        { status: 500 }
      )
    }

    return NextResponse.json({ verified: true, username: resolvedUsername })
  } catch (err) {
    console.error("[verify-bio] unexpected error:", err)
    return NextResponse.json(
      { verified: false, error: "Internal server error." },
      { status: 500 }
    )
  }
}
