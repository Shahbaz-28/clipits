import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { checkRateLimit } from "@/lib/rate-limit"
import { WAITLIST_HONEYPOT_FIELD } from "@/lib/waitlist-constants"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LEN = 254

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? ""
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Unsupported content type." }, { status: 415 })
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const allowedIp = checkRateLimit(`waitlist:ip:${ip}`, 5, 15 * 60 * 1000)
  if (!allowedIp) {
    return NextResponse.json(
      { error: "Too many signups from this network. Please try again later." },
      { status: 429 },
    )
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const trap = body[WAITLIST_HONEYPOT_FIELD]
    if (typeof trap === "string" && trap.trim() !== "") {
      // Silent success so scrapers cannot learn the rule easily.
      return NextResponse.json({ success: true })
    }

    const rawEmail = typeof body.email === "string" ? body.email.trim() : ""
    const role = body.role === "creator" ? "creator" : body.role === "clipper" ? "clipper" : null

    if (!rawEmail || rawEmail.length > MAX_EMAIL_LEN) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }
    if (!EMAIL_RE.test(rawEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }
    if (!role) {
      return NextResponse.json({ error: "Please choose Clipper or Creator." }, { status: 400 })
    }

    const email = rawEmail.toLowerCase()

    const allowedEmail = checkRateLimit(`waitlist:email:${email}`, 8, 60 * 60 * 1000)
    if (!allowedEmail) {
      return NextResponse.json(
        { error: "Too many attempts for this email. Please try again later." },
        { status: 429 },
      )
    }

    const { error } = await supabaseAdmin.from("waitlist_signups").insert({
      email,
      role,
    })

    if (error) {
      const isDuplicate =
        error.code === "23505" ||
        (typeof error.message === "string" && error.message.toLowerCase().includes("duplicate"))
      if (isDuplicate) {
        return NextResponse.json(
          { error: "This email is already on the waitlist.", duplicate: true },
          { status: 409 },
        )
      }
      console.error("[waitlist] insert error:", error)
      return NextResponse.json({ error: "Could not save your signup. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[waitlist] error:", err)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
}
