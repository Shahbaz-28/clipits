# Clixyo s — Project Overview & Documentation

**Version:** 1.0  
**Last updated:** January 2026

This document describes what we are building, what we will use to build it, and the approach we are taking.

---

## 1. What We Are Building

### 1.1 Product vision

**Clixyo s** is a **Content Reward platform** — similar in concept to [Whop Content Rewards](https://help.whop.com/en/articles/11429379-how-to-join-a-whop-content-reward). We connect:

- **Creators / brands** who want their content promoted (campaign owners).
- **Participants (clippers)** who post that content on their own social channels and get **paid per view** (CPM).

In short: **post content → get approved → earn money for the views you bring.**

### 1.2 Core concepts

| Concept | Description |
|--------|-------------|
| **Content Reward / Campaign** | A reward program created by a creator or brand. It defines what content to post, where, and how much is paid per 1,000 views (rate per 1k). |
| **Join a campaign** | A participant joins a campaign and can then submit posts for that campaign. |
| **Submission** | A link (and optional media) to the participant’s social post. Must be approved by the campaign owner/admin before earnings count. |
| **Pay per view** | After approval, the participant is paid based on views (e.g. $X per 1k views), with optional min/max payout per post. |
| **Payout** | Approved earnings can be withdrawn (e.g. to balance, then to bank via Stripe). |

### 1.3 User roles

| Role | Who | Main actions |
|------|-----|----------------|
| **Clipper** | Default for new users. Participants who post and earn. | Browse & join campaigns, submit posts, view own earnings & payouts. |
| **Creator** | Can run campaigns (via approval flow). | Everything a Clipper can do + request new campaigns (creator requests). |
| **Admin** | Platform operator. | Full access: create campaigns directly, approve/reject submissions, process payouts, manage users & creator requests. |

### 1.4 Initial scope: Instagram only

We are **launching with Instagram only**. All campaigns, submissions, and view/payout logic will be for **Instagram** (Reels, posts, etc.). Other platforms (TikTok, YouTube, etc.) will be added later.

- **Campaigns:** Only Instagram campaigns (e.g. `platforms: ["instagram"]` or single-platform UI).
- **Submissions:** Participant submits an **Instagram post/Reel link** (and optionally the media file).
- **Views:** From manual/admin entry or, when we add it, Instagram (Connect Instagram) or manual.
- **Verification:** Optional **Instagram bio verification** (paste code in bio → verify in Clixyo s) to prove ownership of the account.

This keeps the first version simple: one platform, one flow, one set of requirements and assets.

---

### 1.5 Main user flows

**Participant (Clipper) flow — Instagram-only (initial)**

1. **Sign up / sign in** — Supabase Auth (email or OAuth).
2. **Discover campaigns** — Browse campaigns; filter by budget, CPM, category, type. All shown campaigns are **Instagram** campaigns.
3. **Join a campaign** — One click to join; user is then allowed to submit for that campaign.
4. **Post on Instagram** — User posts content on their **Instagram** (Reel or post) per campaign requirements (hashtags, tags, etc.).
5. **Submit in Clixyo s** — User pastes the **Instagram post/Reel link** (and optionally uploads the media file). Submission is stored with `platform: "instagram"`.
6. **(Optional) Verify Instagram account** — To prove they own the account: Clixyo s shows a verification code → user puts it in their **Instagram bio** → user clicks Verify in Clixyo s. We confirm and mark the account as verified (or skip this in v1). See §1.5.1 for the full logic.
7. **Wait for approval** — Admin/creator approves or rejects the submission. Once approved, earnings are calculated from views (see §1.8).
8. **Earn & withdraw** — User sees balance, requests payout, withdraws to bank via Stripe.

Later, when we add TikTok/YouTube: we add platform choice in step 4–5, platform-specific verification (e.g. TikTok connect), and platform-specific view sources (§1.9).

#### 1.5.1 Account verification via code (logic)

We verify that the user owns the Instagram account by having them put a **one-time code** in their Instagram bio; we then check that the code appears there. Same idea as [Whop’s Content Reward verification](https://help.whop.com/en/articles/11429379-how-to-join-a-whop-content-reward).

**Step-by-step logic**

1. **User starts verification**  
   - User is on Clixyo s (e.g. on “Submit” or “Settings → Linked accounts”).  
   - User enters their **Instagram profile URL** (e.g. `https://instagram.com/username`) or we already have it from a submission.  
   - We parse and store the **username** (e.g. `username`).

2. **We generate and show the code**  
   - Backend (Supabase Edge Function or DB + RPC) generates a **unique verification code** (e.g. 6–8 alphanumeric: `Clixyo -A1B2C3`).  
   - Code is stored in DB (e.g. `user_social_accounts` or `verification_codes`): `user_id`, `platform` = `instagram`, `username`, `code`, `status` = `pending`, `created_at`.  
   - Code expires after a short window (e.g. 10–15 minutes) so it can’t be reused.  
   - Frontend shows the code and short instructions: “Add this code to your Instagram bio, then click Verify.”

3. **User adds the code to Instagram**  
   - User opens Instagram → Profile → Edit profile → Bio.  
   - User pastes the code (e.g. `Clixyo -A1B2C3`) into the bio and saves.  
   - User returns to Clixyo s and clicks **Verify**.

4. **We check that the code is in the bio**  
   Two ways we can do this:

   - **Option A – Connect Instagram (OAuth, recommended when we have it)**  
     - User has already connected their Instagram account via Meta/Facebook Login (we have their token).  
     - When user clicks Verify, we call **Meta Graph API** (e.g. get profile / user info) and read the **bio** for that account.  
     - We check: does the bio string contain our stored `code`?  
     - If **yes** → mark verification success (update DB: `status` = `verified`, set `verified_at`).  
     - If **no** → show “Code not found in bio. Make sure you saved and try again.”  
     - User can remove the code from their bio after verification.

   - **Option B – Manual / no OAuth (initial launch)**  
     - We **do not** have an API to read a random user’s bio (Instagram doesn’t offer a public “get this user’s bio” API for other users).  
     - So we **cannot** automatically check the bio without “Connect Instagram.”  
     - **Initial approach:** When user clicks Verify, we either:  
       - **(B1)** Mark as “pending verification” and show “An admin will confirm your account shortly.” Admin manually opens the profile URL, checks that the code is in the bio, and marks the account as verified in the dashboard; or  
       - **(B2)** Trust the user for v1: we mark as “verified” when they click Verify (and optionally audit later or require verification for first payout).

5. **After verification**  
   - We store: `platform` = `instagram`, `username`, `verified_at`, and optionally the profile URL.  
   - We can link future submissions from that Instagram username to this user.  
   - UI shows “Instagram @username ✓ verified.”

**Data we need**

- Table (or columns) for **linked/verified accounts**: e.g. `user_id`, `platform`, `username`, `profile_url`, `verification_code` (last used), `status` (`pending` | `verified` | `failed`), `verified_at`, `created_at`.  
- For Option A: store Instagram **access token** (from OAuth) so we can call Meta API to read bio; encrypt or keep in a secure server-side store.

**Summary**

| Step | Who | What |
|------|-----|------|
| 1 | User | Enters Instagram profile URL (or we have it). |
| 2 | System | Generate unique code, save to DB, show code + instructions. |
| 3 | User | Puts code in Instagram bio, saves, comes back to Clixyo s, clicks Verify. |
| 4 | System | **Option A:** Call Meta API, read bio, check for code → success/fail. **Option B (v1):** Mark pending for admin check, or trust and mark verified. |
| 5 | System | Mark account verified, show success. |

**Creator flow**

1. Request “creator” role; admin approves.
2. Submit a **creator request** for a new Content Reward (title, description, rate per 1k, budget, requirements, assets, etc.).
3. Admin approves the request and creates the campaign (or creator request is denied).
4. Optionally: creator sees their campaigns and performance (future).

**Admin flow**

1. Manage users and roles.
2. Approve/deny creator requests; create campaigns from approved requests or create campaigns directly.
3. Approve or reject submissions; optionally set earnings/views.
4. Process payouts (mark as processed, trigger Stripe when implemented).
5. View platform metrics (users, campaigns, submissions, payouts).

### 1.6 Campaign (Content Reward) details

A campaign includes:

- **Basics:** title, description, category, type (e.g. UGC vs clipping).
- **Budget & pay:** total budget, rate per 1k views, min payout, max payout per post.
- **Progress:** paid out so far, percentage, views count, days left.
- **Requirements:** list of rules (hashtags, tags, song, etc.) — stored as JSONB.
- **Assets:** content provided by the creator for participants to use — stored as JSONB.
- **Platforms:** allowed social platforms (e.g. TikTok, Instagram) — JSONB.
- **Status:** e.g. active, paused, ended.

### 1.7 What we are not building (out of scope for this doc)

- The actual social platforms (TikTok, Instagram, etc.) — we only store links and metadata.
- Fraud detection (e.g. bot views) — to be designed later; schema can support flags and notes.

---

### 1.8 How we calculate views and pay (Content Reward process)

This follows the [Whop Content Reward](https://help.whop.com/en/articles/11429379-how-to-join-a-whop-content-reward) model: **only views after the user submits the post count**; approval unlocks payment; earnings respect min/max payout per post.

#### When do views count?

- **From submission time.** As soon as the participant submits the post link (and optional media) in Clixyo s, we consider that the “start” of tracking. Whop states: *“Only views after you submit count towards payout. Submit as soon as you post to get paid for all of your post’s views.”*
- **Approval does not reset the clock.** Once the admin/creator approves the submission, we pay for **every view since the submission was uploaded** (not only views after approval). So: submit → (views accumulate) → approve → pay for all views since submit.

#### How we calculate earnings per submission

1. **Get view count** for the post (from platform API, manual entry, or admin-set value — see §1.9).
2. **Apply campaign rules:**
   - **Rate:** `earnings = (views / 1000) * campaign.rate_per_1k`
   - **Minimum payout:** If `earnings < campaign.min_payout`, treat as 0 until threshold is met; above that, pay normally.
   - **Maximum payout:** Cap at `campaign.max_payout` per post (no matter how many views).
3. **Store:** Update `submissions.views` and `submissions.earnings`; append a row to `earnings_history` (user, submission, amount, views, rate).
4. **Balance:** Add the earned amount to the user’s balance (or derive balance from `earnings_history`).

#### Payout process (to the participant)

1. **Accumulate to balance:** Approved submissions earn per view (above). Earnings are added to the user’s balance (e.g. on a schedule — e.g. hourly — or on approval + periodic job).
2. **Withdraw:** User requests a payout from balance → we create a `payouts` row (e.g. status `pending`).
3. **Process:** Admin or an Edge Function marks the payout as processed and calls Stripe (or another provider) to send money to the user’s bank. Update `payouts.processed_at` and `payouts.processed_by`.

So: **views (from §1.9) → earnings formula (rate + min/max) → balance → payout request → Stripe withdrawal.**

---

### 1.9 Platform APIs for view counts (what we can use)

We need a **source of view counts** per submission (post link). **Initial (Instagram-only):** we use **manual or admin-set views** for Instagram; optional “Connect Instagram” and API-based views come later. Options: **(A) platform APIs**, **(B) manual entry by admin/creator**, **(C) participant-reported** (with optional verification). Below is what we can use per platform and recommended fallbacks.

#### YouTube

- **API:** [YouTube Data API v3](https://developers.google.com/youtube/v3/docs/videos/list) — `videos.list` with `part=statistics`.
- **How:** Parse video ID from the submission URL (e.g. `youtube.com/watch?v=VIDEO_ID` or `youtu.be/VIDEO_ID`), then `GET https://www.googleapis.com/youtube/v3/videos?part=statistics&id=VIDEO_ID`.
- **Response:** `statistics.viewCount` (string). No auth required for public videos; API key only (quota applies).
- **Use case:** Best option for YouTube links; use in an Edge Function or cron job to refresh `submissions.views`.

#### TikTok

- **API:** [TikTok API – Query Videos](https://developers.tiktok.com/doc/tiktok-api-v1-video-query) — POST to `https://open-api.tiktok.com/video/query/` with `video_ids` and `fields` including `view_count`.
- **Catch:** Requires an **access token for the TikTok user who owns the video** (scope `video.list`). So the **participant** must connect their TikTok account (OAuth); we then use their token to query their video’s view count. We cannot fetch view counts for arbitrary public TikTok URLs without the poster’s token.
- **Use case:** If we add “Connect TikTok” (OAuth), we can periodically call this API for the user’s submitted video IDs and update `submissions.views`.

#### Instagram (Reels / posts)

- **API:** [Instagram Platform – IG Media](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/) and [insights](https://help.instagram.com/202865988324236) (e.g. “views” for Reels).
- **Catch:** View counts are typically available only for **the account that owns the media** (business/creator accounts, with `instagram_basic`, `pages_read_engagement`, etc.). Developers report [permission/endpoint limitations](https://stackoverflow.com/questions/79244409/get-reel-views-from-the-instagram-graph-api) for Reels view counts via the public API.
- **Use case:** If participants connect their Instagram (Meta Login), we may be able to read their own media insights; otherwise treat as “no API” and use manual or admin-set views.

#### Other platforms (e.g. X/Twitter, Twitch)

- Public view-count APIs are limited or require the post owner’s token. Prefer **manual entry** or **admin-set views** unless we integrate a specific partner/API.

#### Recommended approach for Clixyo s

| Priority | Approach | When |
|----------|----------|------|
| 1 | **YouTube Data API v3** | Submission platform = YouTube; parse video ID, call API in Edge Function/cron. |
| 2 | **TikTok / Instagram** | Only after “Connect TikTok” or “Connect Instagram” (OAuth); then use owner’s token to fetch that user’s video metrics. |
| 3 | **Manual / admin-set views** | For all other platforms or when API is unavailable: admin (or creator) can set or update `submissions.views` in the dashboard; earnings then computed from that value. |
| 4 | **Participant-reported views** | Optional: allow participant to submit a view count; admin approves or overwrites before payout (fraud risk; use with caution). |

We will store in the submission: **platform** (e.g. `youtube`, `tiktok`, `instagram`) and **post link**. For YouTube we can also store **video_id** (parsed from URL) for the API. View count is stored in `submissions.views` and kept in sync by whichever source we use (API job or manual update).

---

## 2. What We Will Use (Tech Stack)

We are building with a **Supabase-first** approach: one backend (Supabase) for auth, database, real-time, and storage; a thin serverless layer only where needed.

### 2.1 Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js** (App Router) | React framework, SSR/SSG, API routes if needed. |
| **React 19** | UI components and state. |
| **TypeScript** | Type safety across the app. |
| **Tailwind CSS** | Styling. |
| **Radix UI** | Accessible primitives (dialogs, dropdowns, etc.). |
| **Supabase JS client** | Auth (session, sign in/up, OAuth), database (PostgREST), real-time, storage. |

**Hosting:** Vercel (or similar) for the Next.js app.

### 2.2 Backend & data

| Technology | Purpose |
|------------|---------|
| **Supabase** | Primary backend: Auth, PostgreSQL, Realtime, Storage. |
| **PostgreSQL** | All relational data (users, campaigns, submissions, payouts, etc.). |
| **Row Level Security (RLS)** | Enforce who can read/write which rows (per role and ownership). |
| **Supabase Auth** | Email/password, magic link, OAuth (e.g. Google); JWT for RLS. |
| **Supabase Edge Functions** (Deno) | Server-only logic: e.g. payout processing, Stripe, webhooks, cron-triggered jobs. |

**No separate Node/Express server** for normal app flows. The frontend talks directly to Supabase; Edge Functions handle payouts and external APIs.

### 2.3 Payments (planned)

| Technology | Purpose |
|------------|---------|
| **Stripe** | Connect (for payouts to participants), balance/withdrawals. |
| **Supabase Edge Function** | Call Stripe API securely; update `payouts` and user balance. |

### 2.4 Development & ops

| Tool | Purpose |
|------|---------|
| **Git** | Version control. |
| **Environment variables** | Supabase URL/keys, Stripe keys (never commit secrets). |
| **Supabase Dashboard** | Schema, RLS, Auth settings, logs. |

---

## 3. Approach (Architecture & Strategy)

### 3.1 Architecture: “Complete Supabase”

- **Frontend:** Next.js app uses **only** the Supabase client (and optionally Next API routes for minor server-side helpers).
- **Data & auth:** All reads/writes go through Supabase (PostgREST + Auth). Access control is enforced via **RLS** using the user’s JWT (and `users.role` where needed).
- **Server-side logic:** Only where we must (payments, webhooks, cron): **Supabase Edge Functions** (or a small serverless function) that call Stripe and update the database.

Benefits:

- Single backend to run and secure (Supabase).
- Fewer moving parts than a custom Node API.
- Lower latency (no extra hop through our own API for most requests).
- RLS keeps security at the database layer.

### 3.2 Data model (summary)

| Table | Purpose |
|-------|---------|
| **users** | Profile and role (clipper/creator/admin); extends Supabase `auth.users`. |
| **campaigns** | Content Rewards (budget, rate per 1k, requirements, assets, platforms, status). |
| **user_campaigns** | Join relationship: which users joined which campaigns. |
| **submissions** | Post link, platform, status (pending/approved/rejected), earnings, views, reviewed_by. |
| **payouts** | Withdrawal requests: amount, status, payment_method, processed_at/processed_by. |
| **earnings_history** | Per-earning records (user, submission, amount, views, rate). |
| **creator_requests** | Creator proposals for new campaigns; admin approves or denies. |
| **notifications** | In-app notifications for users. |

Schema and RLS are defined in `backend/supabase-schema-clean.sql` (and applied in Supabase).

### 3.3 Security approach

- **Auth:** Supabase Auth only; no custom auth server.
- **Authorization:** RLS policies on every table:
  - Clippers: own profile, own submissions, own payouts, join campaigns, view active campaigns.
  - Creators: same as clipper + create creator_requests, view own requests.
  - Admins: full read/update on users, campaigns, submissions, payouts, creator_requests (via policies that check `users.role = 'admin'`).
- **Secrets:** Service role key and Stripe keys only in server-side env (Edge Functions / Supabase secrets); never in the frontend.
- **Validation:** Input validation in Edge Functions and, where useful, DB constraints/triggers.

### 3.4 Role-based rules (aligned with RLS)

- **Campaign create:** Only admins create campaigns directly. Creators submit **creator_requests**; admin creates the campaign from an approved request. RLS on `campaigns` should reflect this (e.g. only admin can INSERT, or a dedicated RPC used by Edge Function after approval).
- **Submissions:** Only the participant (and admin) can create/update their submissions; admin can approve/reject and set earnings/views.
- **Payouts:** Users create payout requests for their own balance; only admin (or an Edge Function with service role) can mark payouts as processed and call Stripe.

### 3.5 Phases (high level)

1. **Phase 1 – Supabase-only app**  
   - Frontend uses only Supabase (auth + database).  
   - Remove or bypass the existing Node backend for main flows.  
   - All list/detail/create/update for campaigns, submissions, creator_requests, admin views done via Supabase + RLS.  
   - Align RLS policies with the role rules above.

2. **Phase 2 – Real data & flows**  
   - Replace any remaining mock data (e.g. admin metrics, submission lists) with real Supabase queries.  
   - Implement submission approval and earnings/views updates (admin).  
   - Optional: social account verification (e.g. bio code); add tables/columns as needed.

3. **Phase 3 – Payments**  
   - User balance (or derived from earnings_history).  
   - Payout request flow and “process payout” (Stripe) inside an Edge Function.  
   - Withdraw to bank via Stripe Connect; update `payouts` and balance.

4. **Phase 4 – Automation & polish**  
   - **View sync:** Use platform APIs where available (YouTube Data API v3 for YouTube; TikTok/Instagram only after “Connect account” OAuth) in an Edge Function or cron; otherwise manual/admin-set views (see §1.9).  
   - Automated payouts (e.g. hourly job in Edge Function) that compute earnings from `submissions.views` (rate + min/max) and update balance/earnings_history.  
   - Basic fraud flags if needed (e.g. suspicious view patterns).  
   - Discover/browse campaigns (filters, sort by budget/CPM/newest).

---

## 4. References

- [Whop – How to join a Content Reward](https://help.whop.com/en/articles/11429379-how-to-join-a-whop-content-reward) — product reference for the Content Reward flow (views, pay, submit timing).
- **View-count APIs:**  
  - [YouTube Data API v3 – videos.list](https://developers.google.com/youtube/v3/docs/videos/list) (statistics.viewCount).  
  - [TikTok API – Query Videos](https://developers.tiktok.com/doc/tiktok-api-v1-video-query) (view_count; requires poster’s token).  
  - [Instagram Platform – IG Media](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/) (insights/views; owner’s token).
- **Schema & RLS:** `backend/supabase-schema-clean.sql`
- **Frontend README:** `frontend/README.md` (setup, scripts, existing API list; to be updated as we move to Supabase-only.)

---

## 5. Summary

| Question | Answer |
|----------|--------|
| **What are we building?** | A Content Reward platform (like Whop): creators/brands run campaigns; participants post content, get approved, and earn per view; admins manage everything. |
| **What will we use?** | Next.js + TypeScript + Tailwind + Supabase (Auth, Postgres, RLS, Realtime, Storage) + Supabase Edge Functions for payouts/Stripe. No separate Node backend for main app. |
| **What is the approach?** | Complete Supabase: frontend → Supabase only; RLS for security; Edge Functions only for payments and server-only logic. Phased: Supabase-only first, then real flows, then payments, then automation. |

This document is the single source of truth for **what we’re building**, **what we’re using**, and **how we’re approaching it**. New features and refactors should stay consistent with this overview.
