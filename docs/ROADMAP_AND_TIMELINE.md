# Rippl s – Next steps & timeline

Migration is done. Here’s a **recommended order** of what to build next and **rough time** for each.

---

## 1. Next feature to build: **Profile General settings (save to DB)**

**Why first:** Profile sidebar already shows name/username; General tab is UI-only with fake data. Wiring it makes the profile real and reusable everywhere.

**What to do:**
- Add to `users` (migration): `bio TEXT`, `username TEXT`, `phone TEXT` (name already exists as `first_name`, `last_name`).
- In **General settings**: load these from Supabase `users` for the current user, and on **Save** update `users` (first_name, last_name, bio, username, phone). Sync profile sidebar display name/username from `users` (or keep from auth and only override when set in profile).
- **Time:** ~2–4 hours (migration + form load/save + RLS if needed).

---

## 2. After that: **Earnings (clipper)**

**Why:** Clippers need to see balance and history. You already have `submissions.earnings` and `submissions.status`.

**What to do:**
- **Earnings page:** Sum `submissions.earnings` where `status = 'approved'` (and optionally `user_id = auth.uid()`). Show total balance, list of approved submissions with earnings, maybe “Request payout” as a button (can be disabled or “Coming soon” at first).
- **Time:** ~4–8 hours (query, UI, empty/loading states).

---

## 3. Then: **Balance & Payment methods (profile)**

**Why:** Balance ties to earnings; payment methods are needed for real payouts.

**Options:**
- **Light:** Balance tab shows same total as Earnings (or redirects to Earnings). Payment methods: “Add payout method” → placeholder or a single “PayPal / Bank” field stored on `users` (e.g. `payout_email` or `payout_details`). No real payouts yet.
- **Full:** Integrate Stripe Connect (or similar) for payouts; then Balance = available balance, Payment methods = connected accounts.  
**Time (light):** ~2–4 hours. **Time (full):** ~1–2 weeks (Stripe setup, compliance, testing).

---

## 4. Logout in profile sidebar

**Why:** Right now the Logout button doesn’t sign out.

**What to do:** Use `useAuth().signOut()` and redirect to `/` or `/sign-in`.  
**Time:** ~15–30 minutes.

---

## 5. Optional: **Real Instagram verification**

**Why:** Currently verification is trust-based (user says they added the code).

**What to do:** Use Meta’s Instagram Graph API (or a similar service) to check that the verification code appears in the user’s bio; only then set `instagram_verified_at`.  
**Time:** ~1–2 days (API keys, docs, error handling).

---

## Rough “whole thing” timeline

| Scope | What’s included | Rough time |
|-------|------------------|------------|
| **Minimum viable** | General profile save, Earnings page (balance + list), Balance/Payment placeholders, Logout | **1–2 weeks** (part-time) |
| **Comfortable MVP** | Above + Balance/Payment methods (simple payout field or Stripe Connect), basic error handling, polish | **3–5 weeks** (part-time) |
| **Full product** | Above + real Instagram verification, admin flows, emails, full Stripe payouts, tests | **2–3 months** (part-time) |

“Part-time” = a few hours per day. Full-time focused work can be ~2–3× faster.

---

## Recommended order (summary)

1. **Profile General (save to DB)** – 2–4 h  
2. **Profile sidebar Logout** – ~30 min  
3. **Earnings page (real data)** – 4–8 h  
4. **Balance tab (show balance / link to Earnings)** – 2–4 h  
5. **Payment methods (simple field or “Coming soon”)** – 2–4 h  
6. Then decide: Stripe payouts vs real Instagram verification vs admin/polish.

If you tell me which item you want to do first (e.g. “General profile save” or “Earnings page”), I can outline the exact steps and code changes next.
