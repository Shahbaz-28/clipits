const SOCIALKIT_API_KEY = process.env.SOCIALKIT_API_KEY ?? ""
const SOCIALKIT_BASE = "https://api.socialkit.dev/instagram/stats"

export interface SocialKitStats {
  views: number
  likes: number
  comments: number
}

export async function fetchReelViews(reelUrl: string): Promise<SocialKitStats | null> {
  if (!SOCIALKIT_API_KEY) {
    console.error("[socialkit] SOCIALKIT_API_KEY is not set")
    return null
  }
  try {
    const url = `${SOCIALKIT_BASE}?url=${encodeURIComponent(reelUrl)}&access_key=${SOCIALKIT_API_KEY}`
    const res = await fetch(url, { method: "GET" })
    if (!res.ok) {
      console.error(`[socialkit] HTTP ${res.status} for ${reelUrl}`)
      return null
    }
    const json = await res.json()
    const payload = json.data ?? json
    const views = typeof payload.views === "number" ? payload.views : parseInt(payload.views, 10)
    if (isNaN(views)) {
      console.error("[socialkit] Invalid views value:", payload.views, "full response:", JSON.stringify(json))
      return null
    }
    return {
      views,
      likes: Number(payload.likes) || 0,
      comments: Number(payload.comments) || 0,
    }
  } catch (err) {
    console.error("[socialkit] fetch error:", err)
    return null
  }
}
