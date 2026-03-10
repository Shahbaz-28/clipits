import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { fetchReelMeta } from "@/lib/socialkit"

export async function POST(req: NextRequest) {
  try {
    const { userId, reelUrl } = (await req.json()) as {
      userId: string
      reelUrl: string
    }

    if (!userId || !reelUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      )
    }

    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .select("instagram_username, instagram_verified_at")
      .eq("id", userId)
      .single()

    if (userErr || !user) {
      return NextResponse.json(
        { ok: false, error: "User not found." },
        { status: 404 }
      )
    }

    if (!user.instagram_verified_at || !user.instagram_username) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Instagram account is not verified. Verify your account in Profile → Connected accounts first.",
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

    const verifiedUsername = String(user.instagram_username).replace(/^@/, "").toLowerCase()
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
          error: `This reel belongs to @${meta.author}, but your verified account is @${verifiedUsername}. Please submit a reel from your own account.`,
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

