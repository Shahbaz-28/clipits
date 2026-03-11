import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "./supabase-admin"

interface AuthResult {
  userId: string
  email: string
}

export async function getAuthUser(req: NextRequest): Promise<AuthResult | NextResponse> {
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    const cookieHeader = req.headers.get("cookie") ?? ""
    const match = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/)
    if (match) {
      try {
        const parsed = JSON.parse(decodeURIComponent(match[1]))
        const accessToken = parsed?.access_token ?? parsed?.[0]?.access_token
        if (accessToken) {
          const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken)
          if (!error && user) {
            return { userId: user.id, email: user.email ?? "" }
          }
        }
      } catch { /* fall through */ }
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return { userId: user.id, email: user.email ?? "" }
}

export async function getAuthAdmin(req: NextRequest): Promise<AuthResult | NextResponse> {
  const result = await getAuthUser(req)
  if (result instanceof NextResponse) return result

  const { data: profile, error } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", result.userId)
    .single()

  if (error || !profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 })
  }

  return result
}

export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}
