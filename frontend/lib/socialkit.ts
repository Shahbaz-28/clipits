const SOCIALKIT_API_KEY = process.env.SOCIALKIT_API_KEY ?? ""
const SOCIALKIT_BASE = "https://api.socialkit.dev/instagram/stats"
const SOCIALKIT_CHANNEL_BASE = "https://api.socialkit.dev/instagram/channel-stats"
const SOCIALKIT_CACHE_TTL_MS = 5 * 60 * 1000

type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const reelViewsCache = new Map<string, CacheEntry<SocialKitStats | null>>()
const reelMetaCache = new Map<string, CacheEntry<SocialKitReelMeta | null>>()
const profileCache = new Map<string, CacheEntry<SocialKitProfile | null>>()

function normalizeInputUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ""
  const withProto = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
  try {
    const u = new URL(withProto)
    u.hash = ""
    u.search = ""
    u.hostname = u.hostname.toLowerCase()
    return u.toString().replace(/\/+$/, "")
  } catch {
    return withProto.replace(/\/+$/, "")
  }
}

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() >= entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry.value
}

function setCached<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T) {
  cache.set(key, { value, expiresAt: Date.now() + SOCIALKIT_CACHE_TTL_MS })
}

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
  const normalizedProfileUrl = normalizeInputUrl(profileUrl)
  const cached = getCached(profileCache, normalizedProfileUrl)
  if (cached !== undefined) return cached
  try {
    const url = `${SOCIALKIT_CHANNEL_BASE}?url=${encodeURIComponent(normalizedProfileUrl)}&access_key=${SOCIALKIT_API_KEY}`
    const res = await fetch(url, { method: "GET" })
    if (!res.ok) {
      console.error(`[socialkit] channel-stats HTTP ${res.status} for ${normalizedProfileUrl}`)
      setCached(profileCache, normalizedProfileUrl, null)
      return null
    }
    const json = await res.json()
    const data = json.data ?? json
    if (!data.username && !data.bio && data.bio !== "") {
      console.error("[socialkit] unexpected channel-stats response:", JSON.stringify(json))
      setCached(profileCache, normalizedProfileUrl, null)
      return null
    }
    const parsed = {
      username: data.username ?? "",
      bio: data.bio ?? "",
      followers: Number(data.followers) || 0,
      verified: !!data.verified,
      avatar: data.avatar ?? "",
      nickname: data.nickname ?? "",
    }
    setCached(profileCache, normalizedProfileUrl, parsed)
    return parsed
  } catch (err) {
    console.error("[socialkit] channel-stats fetch error:", err)
    setCached(profileCache, normalizedProfileUrl, null)
    return null
  }
}

export async function fetchReelViews(reelUrl: string): Promise<SocialKitStats | null> {
  if (!SOCIALKIT_API_KEY) {
    console.error("[socialkit] SOCIALKIT_API_KEY is not set")
    return null
  }
  const normalizedReelUrl = normalizeInputUrl(reelUrl)
  const cached = getCached(reelViewsCache, normalizedReelUrl)
  if (cached !== undefined) return cached
  try {
    const url = `${SOCIALKIT_BASE}?url=${encodeURIComponent(normalizedReelUrl)}&access_key=${SOCIALKIT_API_KEY}`
    const res = await fetch(url, { method: "GET" })
    if (!res.ok) {
      console.error(`[socialkit] HTTP ${res.status} for ${normalizedReelUrl}`)
      setCached(reelViewsCache, normalizedReelUrl, null)
      return null
    }
    const json = await res.json()
    const payload = json.data ?? json
    const views = typeof payload.views === "number" ? payload.views : parseInt(payload.views, 10)
    if (isNaN(views)) {
      console.error("[socialkit] Invalid views value:", payload.views, "full response:", JSON.stringify(json))
      setCached(reelViewsCache, normalizedReelUrl, null)
      return null
    }
    const parsed = {
      views,
      likes: Number(payload.likes) || 0,
      comments: Number(payload.comments) || 0,
    }
    setCached(reelViewsCache, normalizedReelUrl, parsed)
    return parsed
  } catch (err) {
    console.error("[socialkit] fetch error:", err)
    setCached(reelViewsCache, normalizedReelUrl, null)
    return null
  }
}

export async function fetchReelMeta(reelUrl: string): Promise<SocialKitReelMeta | null> {
  if (!SOCIALKIT_API_KEY) {
    console.error("[socialkit] SOCIALKIT_API_KEY is not set")
    return null
  }
  const normalizedReelUrl = normalizeInputUrl(reelUrl)
  const cached = getCached(reelMetaCache, normalizedReelUrl)
  if (cached !== undefined) return cached
  try {
    const url = `${SOCIALKIT_BASE}?url=${encodeURIComponent(normalizedReelUrl)}&access_key=${SOCIALKIT_API_KEY}`
    const res = await fetch(url, { method: "GET" })
    if (!res.ok) {
      console.error(`[socialkit] HTTP ${res.status} for ${normalizedReelUrl}`)
      setCached(reelMetaCache, normalizedReelUrl, null)
      return null
    }
    const json = await res.json()
    const payload = json.data ?? json
    const views = typeof payload.views === "number" ? payload.views : parseInt(payload.views, 10)
    if (isNaN(views)) {
      console.error("[socialkit] Invalid views value:", payload.views, "full response:", JSON.stringify(json))
      setCached(reelMetaCache, normalizedReelUrl, null)
      return null
    }
    const author = payload.author ?? ""
    const authorLink = payload.authorLink ?? ""
    const parsed = {
      views,
      likes: Number(payload.likes) || 0,
      comments: Number(payload.comments) || 0,
      author,
      authorLink,
    }
    setCached(reelMetaCache, normalizedReelUrl, parsed)
    return parsed
  } catch (err) {
    console.error("[socialkit] fetch meta error:", err)
    setCached(reelMetaCache, normalizedReelUrl, null)
    return null
  }
}
