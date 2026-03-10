const SOCIALKIT_API_KEY = process.env.SOCIALKIT_API_KEY ?? ""
const SOCIALKIT_BASE = "https://api.socialkit.dev/instagram/stats"
const SOCIALKIT_CHANNEL_BASE = "https://api.socialkit.dev/instagram/channel-stats"

export interface SocialKitStats {
  views: number
  likes: number
  comments: number
}

export interface SocialKitReelMeta {
  views: number
  likes: number
  comments: number
  author: string
  authorLink: string
}

export interface SocialKitProfile {
  username: string
  bio: string
  followers: number
  verified: boolean
  avatar: string
  nickname: string
}

export async function fetchInstagramProfile(profileUrl: string): Promise<SocialKitProfile | null> {
  if (!SOCIALKIT_API_KEY) {
    console.error("[socialkit] SOCIALKIT_API_KEY is not set")
    return null
  }
  try {
    const url = `${SOCIALKIT_CHANNEL_BASE}?url=${encodeURIComponent(profileUrl)}&access_key=${SOCIALKIT_API_KEY}`
    const res = await fetch(url, { method: "GET" })
    if (!res.ok) {
      console.error(`[socialkit] channel-stats HTTP ${res.status} for ${profileUrl}`)
      return null
    }
    const json = await res.json()
    const data = json.data ?? json
    if (!data.username && !data.bio && data.bio !== "") {
      console.error("[socialkit] unexpected channel-stats response:", JSON.stringify(json))
      return null
    }
    return {
      username: data.username ?? "",
      bio: data.bio ?? "",
      followers: Number(data.followers) || 0,
      verified: !!data.verified,
      avatar: data.avatar ?? "",
      nickname: data.nickname ?? "",
    }
  } catch (err) {
    console.error("[socialkit] channel-stats fetch error:", err)
    return null
  }
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

export async function fetchReelMeta(reelUrl: string): Promise<SocialKitReelMeta | null> {
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
    const author = payload.author ?? ""
    const authorLink = payload.authorLink ?? ""
    return {
      views,
      likes: Number(payload.likes) || 0,
      comments: Number(payload.comments) || 0,
      author,
      authorLink,
    }
  } catch (err) {
    console.error("[socialkit] fetch meta error:", err)
    return null
  }
}
