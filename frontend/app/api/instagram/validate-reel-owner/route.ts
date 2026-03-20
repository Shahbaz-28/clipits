import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { fetchReelMeta } from "@/lib/socialkit"
import { getAuthUser, isAuthError } from "@/lib/api-auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (isAuthError(auth)) return auth
  const userId = auth.userId
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const allowed = checkRateLimit(`instagram-validate-owner:${userId}:${ip}`, 15, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many validation attempts. Please wait a minute and try again." },
      { status: 429 },
    )
  }

  try {
    const { reelUrl, accountId } = (await req.json()) as {
      reelUrl: string
      accountId: string
    }

    if (!reelUrl || !accountId) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      )
    }

    const { data: account, error: accErr } = await supabaseAdmin
      .from("user_instagram_accounts")
      .select("username, verified_at, user_id")
      .eq("id", accountId)
      .single()

    if (accErr || !account) {
      return NextResponse.json(
        { ok: false, error: "Instagram account record not found." },
        { status: 404 }
      )
    }

    if (account.user_id !== userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 403 }
      )
    }

    if (!account.verified_at || !account.username) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This Instagram account is not verified. Verify it in Profile \u2192 Connected accounts first.",
        },
        { status: 403 }
      )
    }

    const meta = await fetchReelMeta(reelUrl)
    if (!meta) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Could not fetch reel details from Instagram. Make sure the link is correct and the reel is public.",
        },
        { status: 422 }
      )
    }

    const verifiedUsername = String(account.username).replace(/^@/, "").toLowerCase()
    const reelAuthor = String(meta.author || "").replace(/^@/, "").toLowerCase()

    if (!reelAuthor) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Could not determine reel owner from Instagram. Please double-check the link, or try again later.",
        },
        { status: 422 }
      )
    }

    if (reelAuthor !== verifiedUsername) {
      return NextResponse.json(
        {
          ok: false,
          error: `This reel belongs to @${meta.author}, but the selected account is @${account.username}. Please submit a reel from the correct account.`,
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ ok: true, author: meta.author })
  } catch (err) {
    console.error("[validate-reel-owner] unexpected error:", err)
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    )
  }
}
