# ClipIts — Project Rules

Use these rules for consistent code generation and alignment. Do not rely on a separate Node backend for app flows; follow the docs and phases.

---

## 1. Architecture & stack

- **Complete Supabase:** All app data and auth go through Supabase (PostgREST + Auth). No separate Node/Express API for normal app flows. Use Supabase Edge Functions only for payouts, Stripe, webhooks, or cron.
- **Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind, Radix UI. Use the Supabase JS client for auth and data; no `lib/api.ts` calls to a custom backend for new features.
- **Security:** Never use the Supabase service role key or Stripe secrets in the frontend. RLS must be enabled on all app tables; access control by `auth.uid()` and `users.role` (clipper/creator/admin).

---

## 2. Scope & product alignment

- **Instagram-only (initial):** New features assume a single platform: Instagram. Campaigns and submissions are for Instagram (Reels/posts). Don’t add TikTok/YouTube flows or multi-platform UI until the plan says so.
- **Single source of truth:** Follow `docs/IDEA_FLOW_AND_PLAN.md` for what to build, flows, and phase order. Use `docs/PROJECT_OVERVIEW.md` for product logic, verification, and APIs. Don’t invent features or flows that contradict these.
- **Phases:** Implement in order: Phase 1 (auth, roles, campaigns list/detail, join) → Phase 2 (submit, review, views/earnings) → Phase 3 (create campaign, creator requests) → Phase 4 (payouts, Stripe) → Phase 5 (verification, polish). Don’t jump to payouts or multi-platform before submissions and approval work.

---

## 3. Naming & structure

- **Naming:** Use snake_case in DB and Supabase (e.g. `rate_per_1k`, `created_at`). Use camelCase in TypeScript/React (e.g. `ratePer1k`, `createdAt`) and map at the boundary if needed.
- **Roles:** Exactly three: `clipper`, `creator`, `admin`. Default new users to `clipper`. Check role from `users.role` (from DB), not from JWT claims only.
- **Campaign types:** Use `ugc` and `clipping` (or the exact enum/values from the schema). Submission `platform`: `instagram` for now.
- **Submission status:** e.g. `pending`, `approved`, `rejected`. Payout status: e.g. `pending`, `processed`.

---

## 4. Code quality & patterns

- **TypeScript:** Strict mode on. Type API responses and Supabase types (e.g. generated types or hand-written interfaces). No `any` for domain objects (campaigns, submissions, users).
- **Components:** Prefer small, focused components. Use existing UI in `frontend/components/ui` (Radix-based). Keep dashboard/admin components under `components/dashboard` and `components/admin`.
- **Data fetching:** Use Supabase client from `lib/supabase.ts` (and server/client helpers if you add them). For protected data, rely on the user’s session; don’t pass tokens to a custom backend for new features.
- **Forms:** Validate required fields (e.g. campaign name, rate, budget; submission link, platform). Show clear errors; don’t silently fail.

---

## 5. What not to do

- **No new Node API routes** for app flows (auth, campaigns, submissions, payouts). Use Supabase + Edge Functions only.
- **No hardcoded secrets** (Supabase keys, Stripe keys) in repo or frontend. Use env vars (e.g. `NEXT_PUBLIC_*` for client-safe Supabase URL/anon key only).
- **No skipping RLS** or adding “public” policies that expose other users’ data. Admins get access via RLS policies that check `users.role = 'admin'`.
- **No new platforms** (TikTok, YouTube) in UI or submission flow until the plan explicitly adds them.
- **No mock data in production paths:** Replace any remaining mock arrays (e.g. admin users, submissions) with real Supabase queries once the schema is defined.

---

## 6. References to cite in prompts

- When asking for a feature, mention the phase (e.g. “Phase 2: submit content”) or the doc section (e.g. “Participant flow step 5”).
- When adding tables or columns, say “per PROJECT_OVERVIEW / schema” so the generator stays aligned with the schema (once the schema is redesigned and documented).
- For verification, say “per PROJECT_OVERVIEW §1.5.1” so the code follows the code-in-bio flow.

---

## Summary checklist

| Area | Rule in one line |
|------|-------------------|
| Backend | Supabase only; no Node API for app flows; Edge Functions for Stripe/jobs. |
| Frontend | Next.js App Router, TypeScript, Tailwind, Supabase client. |
| Scope | Instagram-only; follow IDEA_FLOW_AND_PLAN and PROJECT_OVERVIEW. |
| Phases | Build in order: 1 → 2 → 3 → 4 → 5; no skipping. |
| Naming | snake_case in DB, camelCase in TS; roles: clipper/creator/admin. |
| Security | No service role or Stripe keys in frontend; validate inputs. |
| Quality | Strict TS, typed responses, small components, validate forms. |
| Don’t | No new backend API, no new platforms yet, no mocks in prod paths. |
