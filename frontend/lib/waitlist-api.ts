import { WAITLIST_HONEYPOT_FIELD } from "@/lib/waitlist-constants"

export type WaitlistRole = "clipper" | "creator"

export { WAITLIST_HONEYPOT_FIELD }

export type JoinWaitlistResult =
  | { ok: true }
  | { ok: false; error: string; duplicate?: boolean }

export async function joinWaitlist(
  email: string,
  role: WaitlistRole,
  honeypotValue = "",
): Promise<JoinWaitlistResult> {
  const res = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      role,
      [WAITLIST_HONEYPOT_FIELD]: honeypotValue,
    }),
  })
  let data: { error?: string; duplicate?: boolean } = {}
  try {
    data = (await res.json()) as typeof data
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    return {
      ok: false,
      error: data.error ?? "Something went wrong. Please try again.",
      duplicate: res.status === 409 || Boolean(data.duplicate),
    }
  }
  return { ok: true }
}
