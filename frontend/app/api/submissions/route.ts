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
  const allowed = checkRateLimit(`submissions-create:${userId}:${ip}`, 8, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many submission attempts. Please wait a minute and try again." }, { status: 429 })
  }

  try {
    const { campaignId, contentLink, accountId } = (await req.json()) as {
      campaignId: string
      contentLink: string
      accountId: string
    }

    if (!campaignId || !contentLink?.trim() || !accountId) {
      return NextResponse.json(
        { error: "Missing campaignId, contentLink, or accountId." },
        { status: 400 },
      )
    }

    const link = contentLink.trim()
    const withProto = link.startsWith("http") ? link : `https://${link}`
    let normalizedLink = withProto.replace(/\/+$/, "")
    try {
      const u = new URL(withProto)
      u.hash = ""
      u.search = ""
      u.hostname = u.hostname.toLowerCase()
      normalizedLink = u.toString().replace(/\/+$/, "")
    } catch {
      // If URL parsing fails, fall back to trimmed input with protocol and no trailing slashes.
    }

    const { data: campaignRow, error: campaignErr } = await supabaseAdmin
      .from("campaigns")
      .select("id, status")
      .eq("id", campaignId)
      .single()

    if (campaignErr || !campaignRow) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
    }
    if (campaignRow.status !== "live") {
      return NextResponse.json(
        { error: "This campaign is not accepting submissions." },
        { status: 403 },
      )
    }

    const { data: existing } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("content_link", normalizedLink)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "This link has already been submitted for this campaign." },
        { status: 400 },
      )
    }

    const { data: account, error: accErr } = await supabaseAdmin
      .from("user_instagram_accounts")
      .select("username, verified_at, user_id")
      .eq("id", accountId)
      .single()

    if (accErr || !account) {
      return NextResponse.json(
        { error: "Instagram account record not found." },
        { status: 404 },
      )
    }
    if (account.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
    }
    if (!account.verified_at || !account.username) {
      return NextResponse.json(
        { error: "This Instagram account is not verified. Verify it in Profile → Connected accounts first." },
        { status: 403 },
      )
    }

    const meta = await fetchReelMeta(normalizedLink)
    if (!meta) {
      return NextResponse.json(
        { error: "Could not fetch reel details. Make sure the link is correct and the reel is public." },
        { status: 422 },
      )
    }
    const verifiedUsername = String(account.username).replace(/^@/, "").toLowerCase()
    const reelAuthor = String(meta.author || "").replace(/^@/, "").toLowerCase()
    if (!reelAuthor || reelAuthor !== verifiedUsername) {
      return NextResponse.json(
        {
          error:
            reelAuthor && reelAuthor !== verifiedUsername
              ? `This reel belongs to @${meta.author}, but the selected account is @${account.username}.`
              : "Could not determine reel owner. Please double-check the link.",
        },
        { status: 400 },
      )
    }

    const { data: joined } = await supabaseAdmin
      .from("user_campaigns")
      .select("user_id")
      .eq("user_id", userId)
      .eq("campaign_id", campaignId)
      .limit(1)

    if (!joined || joined.length === 0) {
      return NextResponse.json(
        { error: "You must join this campaign from Explore before submitting." },
        { status: 403 },
      )
    }

    const { error: insertError } = await supabaseAdmin.from("submissions").insert({
      campaign_id: campaignId,
      user_id: userId,
      content_link: normalizedLink,
      platform: "instagram",
      status: "pending",
      instagram_account_id: accountId,
      // Capture baseline views at submission time so we don't have to call SocialKit again on approval.
      // This makes payouts consistent even if admin reviews later.
      baseline_views: meta.views,
      latest_views: meta.views,
      view_count: 0,
      earnings: 0,
    })

    if (insertError) {
      console.error("[submissions] insert error:", insertError)
      return NextResponse.json({ error: "Failed to create submission." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[submissions] error:", err)
    return NextResponse.json({ error: "Failed to create submission." }, { status: 500 })
  }
}
