# ClipIt – Build Progress

## Completed

- [x] **Supabase client setup** – `frontend/lib/supabase.ts` with env vars
- [x] **Auth context** – `frontend/lib/auth-context.tsx` with session, user, profile (role + onboarding_done)
- [x] **Sign-in page** – Email/password + Google OAuth → redirects to `/dashboard`
- [x] **Sign-up page** – Email/password + Google OAuth → redirects to `/onboarding`
- [x] **Onboarding page** – Role selection (Clipper / Creator) → updates `users` table
- [x] **Dashboard layout** – Redirects to `/sign-in` if no session, `/onboarding` if not onboarded
- [x] **Role-based sidebar** – Different menu items for Clipper vs Creator
- [x] **Role-based main content** – Renders different pages based on role
- [x] **Supabase schema (Phase 1)** – `users` table + trigger + RLS policies (`docs/SUPABASE_SCHEMA_PHASE1.sql`)
- [x] **Supabase schema (Phase 2)** – `campaigns` + `user_campaigns` tables + RLS (`docs/SUPABASE_SCHEMA_PHASE2.sql`)
- [x] **Campaigns list (Explore)** – Fetch active campaigns from Supabase; loading/empty/error states
- [x] **Join campaign flow** – Join button inserts `user_campaigns`, then navigates to Joined campaign page; “Already joined” shows “View campaign”
- [x] **Creator: Create campaign** – Full create/edit modal: create (goes live or save draft on close), edit draft (Save changes / Publish), My Campaigns list with Edit-only on draft cards
- [x] **Campaign feature end-to-end** – Create → Draft/Active → Explore (active only) → Join → Joined campaign page; creator sees My Campaigns (draft + active), Edit → modal (Save / Publish)
- [x] **Supabase schema (Phase 3)** – `submissions` table + RLS (`docs/SUPABASE_SCHEMA_PHASE3.sql`)
- [x] **Submit Content** – Modal wired to Supabase: post link + platform; insert submission (pending); only if user joined campaign
- [x] **My Submissions (Clipper)** – List own submissions with status, views, earnings; link to campaign and content
- [x] **Submissions (Creator)** – List submissions for creator’s campaigns; Approve (set view count → earnings), Reject (optional reason); update views on approved

---

**Note:** Run Phase 1, then Phase 2, then Phase 3 SQL in Supabase SQL Editor before using campaigns and submissions.

---

## Next Up

- [ ] **Earnings / Payouts** – Balance, payout history, request payout (e.g. stripe or manual)
