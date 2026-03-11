# Clixyo s — Complete Idea, Flow & Build Plan

**Single doc:** What we're building, how it flows, which features first, and the execution plan.

**References:**
- [Whop Docs — Content Rewards (Growth/Marketing)](https://docs.whop.com/manage-your-business/growth-marketing/content-rewards)
- [Whop Help — Content Rewards: Creator & Participant Guide](https://help.whop.com/en/articles/11430668-whop-content-rewards-creator-participant-guide)
- Project detail: `docs/PROJECT_OVERVIEW.md`

---

## Part 1 — Complete idea (what we're gonna build)

### 1.1 Product in one sentence

**Clixyo s** is a **Content Reward platform**: creators/brands run campaigns; participants post content on **Instagram**, submit the link, get approved, and **earn per view** (CPM). We manage campaigns, submissions, approval, and payouts. **Initial scope: Instagram only.**

### 1.2 Campaign types (from Whop)

| Type | What it is | Use case |
|------|------------|----------|
| **Clipping** | Creators turn your long-form content (podcasts, livestreams, webinars) into short clips for Instagram Reels. | Long-form content with quotable segments, key talking points, great moments. |
| **UGC (User-Generated Content)** | Creators make **original** content featuring your brand from your guidelines. | Brand awareness, services in action, testimonials, success stories. |

We support both; campaign has a **type** (e.g. `clipping` | `ugc`).

### 1.3 Campaign setup (what we need to build)

Aligned with [Whop Content Rewards setup](https://docs.whop.com/manage-your-business/growth-marketing/content-rewards):

| Field | Purpose |
|-------|---------|
| **Campaign name** | Public; can include rate (e.g. "Fanatics UGC - $3 per 1K views"). |
| **Campaign type** | `UGC` or `Clipping`. |
| **Brand category** | Category that represents the brand (helps creators target). |
| **Campaign budget** | Total amount to spend (like ad spend). |
| **Reward rate** | $ per **1,000 views** (CPM). |
| **Minimum payout** | Min $ a creator must earn from one video before it’s submitted for review (e.g. $6 min + $3/1k → only 2k+ views get reviewed). |
| **Maximum payout** | Cap per **one video** (e.g. $3k max at $3/1k = 1M views cap). |
| **Flat fee bonus (optional)** | Extra $ per approved submission (e.g. $10 flat + view-based = more attractive to creators). |
| **Platform selection** | Which platforms accepted — **we start with Instagram only.** |
| **Available content / Assets** | What we give creators: for clipping = footage/assets; for UGC = guidelines, examples, links (e.g. Google Doc). |
| **Requirements** | Rules for approval: messaging, length/format, prohibited content, brand mentions, quality. |

Plus: **Fund and launch** — campaign needs budget before it goes **Active**; we can support "Pending budget" → "Active" when funded. **Top up** = add more budget later.

### 1.4 How the system works (engineering flow)

1. **Set up campaign** — Admin/creator creates campaign with the fields above and (when we have it) funds it.
2. **Configure payment** — Rate per 1k, min/max payout, optional flat fee; budget.
3. **Creators make and distribute content** — Participants post on Instagram per requirements.
4. **Review submissions** — Admin/creator approves or rejects (manual review).
5. **Performance tracking and payments** — After approval, we pay based on views (manual/admin-set views at first; APIs later). Optional: 30-day verification period before payout (like Whop) — can be a setting later.

### 1.5 Roles and who does what

| Role | Who | Main actions |
|------|-----|----------------|
| **Clipper** | Participant (default). | Discover campaigns, join, post on Instagram, submit link, (optional) verify account, view earnings, request payout. |
| **Creator** | Can run campaigns. | Everything Clipper + request new campaigns (creator requests); admin approves request and creates campaign. |
| **Admin** | Platform operator. | Create campaigns directly, fund campaigns, approve/reject submissions, set/update views, process payouts, manage users and creator requests. |

### 1.6 Payout rules (from Whop, we can adopt)

- **When paid:** After submission is **approved**; optionally after a verification period (e.g. 30 days).
- **Minimum payout:** e.g. $0.50 for hourly/rollover; for per-view we already have min payout per video.
- **No paid ads:** Content must reach viewers **organically** (we can enforce this in requirements / policy).
- **Balance → bank:** Payouts go to user balance; user withdraws to bank (Stripe).

### 1.7 Initial scope summary

- **Platform:** **Instagram only** (Reels/posts).
- **Views:** Manual or admin-set at first; "Connect Instagram" / API later.
- **Verification:** Optional Instagram bio code verification (manual check or trust in v1; OAuth check when we have Connect Instagram).
- **Tech:** Complete Supabase (frontend → Supabase; RLS; Edge Functions for payouts/Stripe).

---

## Part 2 — Flows (step-by-step)

### 2.1 Participant (Clipper) flow — Instagram-only

| Step | Action | Where |
|------|--------|--------|
| 1 | Sign up / sign in | Auth (Supabase). |
| 2 | Discover campaigns | List/filter by budget, CPM, category, type; all Instagram. |
| 3 | Open campaign, read requirements & assets | Campaign detail page. |
| 4 | Join campaign | One click; stored in `user_campaigns`. |
| 5 | Post on Instagram (Reel/post) per requirements | Off-platform. |
| 6 | Submit in Clixyo s: paste Instagram post/Reel link (+ optional media) | Submit form; stored in `submissions` with `platform: 'instagram'`. |
| 7 | (Optional) Verify Instagram: add code to bio → click Verify | Verification flow (§1.5.1 in PROJECT_OVERVIEW). |
| 8 | Wait for approval | Admin/creator reviews. |
| 9 | Once approved: earn per view (rate + min/max); see balance | Earnings/balance UI. |
| 10 | Request payout → withdraw to bank (Stripe) | Payout flow. |

### 2.2 Creator flow

| Step | Action | Where |
|------|--------|--------|
| 1 | Have Clipper account; request Creator role | Settings or admin grants. |
| 2 | Submit **creator request**: campaign name, type, category, budget, rate, min/max, requirements, assets, etc. | Creator request form. |
| 3 | Admin approves or denies | Admin dashboard. |
| 4 | If approved: admin creates campaign from request (or creator creates if we allow) | Campaign create. |
| 5 | (Later) Creator sees their campaigns and performance | Creator dashboard. |

### 2.3 Admin flow

| Step | Action | Where |
|------|--------|--------|
| 1 | Sign in as admin | Auth. |
| 2 | Create campaign directly **or** approve creator request → create campaign | Campaigns / Creator requests. |
| 3 | (When we have it) Fund campaign: add budget → campaign moves to Active | Campaign funding. |
| 4 | View all submissions; approve or reject; optionally set views/earnings | Submissions table. |
| 5 | Process payouts (mark processed, trigger Stripe) | Payouts table. |
| 6 | Manage users, roles, metrics | Users / Roles / Metrics. |
| 7 | (Optional) Manually verify Instagram accounts (pending verification list) | Verification queue. |

### 2.4 Flow summary diagram (text)

```
Participant:  Sign up → Discover → Join campaign → Post on IG → Submit link → [Verify IG] → Wait approval → Earn → Payout
Creator:      Get role → Submit creator request → Admin approves → Campaign created
Admin:        Create/fund campaign OR Approve creator request → Review submissions (approve/reject) → Process payouts
```

---

## Part 3 — Which features we're gonna start first (priority order)

Build in this order so we get a working end-to-end loop fast, then add polish and scale.

### Phase 1 — Foundation (must have first)

| # | Feature | What to build | Done when |
|---|---------|----------------|-----------|
| 1.1 | **Auth** ✅ | Sign up, sign in (Supabase Auth); session, protected routes | User can sign up/in and hit dashboard. |
| 1.2 | **Roles** ✅ | Store role in `users`; RLS and UI by role (clipper/creator/admin); onboarding (Join as Clipper / Creator) | Dashboard shows the right nav/actions per role. |
| 1.3 | **Campaigns — list & detail** ✅ | List active Instagram campaigns; filters (budget, CPM, category, type); campaign detail page with requirements & assets | Participant can discover and read a campaign. |
| 1.4 | **Join campaign** ✅ | Join button → insert `user_campaigns`; only joined users can submit | Participant can join and see "Joined" state. |

### Phase 2 — Submissions and approval

| # | Feature | What to build | Done when |
|---|---------|----------------|-----------|
| 2.1 | **Submit content** | Form: Instagram post/Reel link (+ optional media upload); insert `submissions`; only for joined campaigns | Participant can submit a link per campaign. |
| 2.2 | **Admin: review submissions** | List submissions (pending/approved/rejected); approve/reject buttons; optional review notes | Admin can approve or reject each submission. |
| 2.3 | **Views & earnings (manual)** | Admin can set `submissions.views`; we compute earnings (rate + min/max) and update `submissions.earnings` + `earnings_history` | Approved submissions get views and earnings (admin-set). |
| 2.4 | **Participant: my submissions & earnings** | Participant sees own submissions, status, earnings, and balance | Participant sees what they earned. |

### Phase 3 — Campaign creation and creator requests

| # | Feature | What to build | Done when |
|---|---------|----------------|-----------|
| 3.1 | **Admin: create campaign** | Full campaign form (name, type, category, budget, rate, min/max, flat fee optional, platforms, assets, requirements); insert `campaigns` | Admin can create an Instagram campaign. |
| 3.2 | **Creator request** | Creator submits request (same fields as campaign); insert `creator_requests` | Creator can request a new campaign. |
| 3.3 | **Admin: approve/deny creator request** | List creator requests; approve → create campaign from request (or deny) | Admin can turn a request into a campaign. |
| 3.4 | **(Optional) Fund campaign** | Campaign has budget/balance; "Add budget" → campaign becomes Active; top-up later | Campaigns can be funded and activated. |

### Phase 4 — Payouts and balance

| # | Feature | What to build | Done when |
|---|---------|----------------|-----------|
| 4.1 | **User balance** | Balance = sum of approved earnings (or stored balance); show in profile/dashboard | User sees their balance. |
| 4.2 | **Request payout** | User requests payout (amount ≤ balance); insert `payouts` (pending) | User can request withdrawal. |
| 4.3 | **Admin: process payout** | List payouts; "Process" → call Stripe (or mark processed); update `payouts` and balance | Admin can process payouts (Stripe when integrated). |
| 4.4 | **Stripe Connect (withdraw to bank)** | Connect Stripe; user connects bank; payout goes to bank | User can withdraw to bank. |

### Phase 5 — Verification and polish

| # | Feature | What to build | Done when |
|---|---------|----------------|-----------|
| 5.1 | **Instagram verification (code in bio)** | Generate code → user adds to bio → Verify; Option B (manual/admin or trust) for v1 | We have verification flow; admin can verify or we trust. |
| 5.2 | **Discover/sort** | Sort campaigns by budget, CPM, newest, etc. | Better discovery. |
| 5.3 | **Notifications** | In-app (and optional email) for approval, payout, etc. | Users get notified. |
| 5.4 | **Metrics / analytics** | Admin dashboard: total users, campaigns, submissions, payouts; charts if needed | Admin sees platform health. |

### Phase 6 — Later (scale and automate)

| # | Feature | What to build |
|---|---------|----------------|
| 6.1 | **Connect Instagram (OAuth)** | Meta Login; read bio for verification; optional view sync. |
| 6.2 | **View sync (APIs)** | YouTube/TikTok/Instagram view APIs where available; cron/Edge Function to update `submissions.views`. |
| 6.3 | **Automated payouts** | Cron/Edge Function: compute earnings from views, update balance, optional auto-payout. |
| 6.4 | **Multi-platform** | TikTok, YouTube; platform choice in campaign and submission. |
| 6.5 | **Fraud / quality** | Flags for suspicious views; optional 30-day hold; policy "no paid ads." |

---

## Part 4 — Proper plan (execution)

### Principles

- **One platform first:** Instagram only until Phase 2–4 are solid.
- **Complete Supabase:** No Node backend for app flows; RLS for security; Edge Functions for Stripe and jobs.
- **Ship in order:** Phase 1 → 2 → 3 → 4 → 5 → 6; don’t skip to payouts before submissions work.

### Suggested timeline (high level)

| Phase | Focus | Outcome |
|-------|--------|--------|
| **Phase 1** | Auth, roles, campaigns list/detail, join | User can sign in, see campaigns, join. |
| **Phase 2** | Submit, review, manual views, earnings, "my submissions" | Full loop: submit → approve → earnings. |
| **Phase 3** | Create campaign, creator request, approve request, (optional) fund | Admins and creators can create campaigns. |
| **Phase 4** | Balance, request payout, process payout, Stripe | Users can withdraw to bank. |
| **Phase 5** | IG verification, discover/sort, notifications, metrics | Polish and trust. |
| **Phase 6** | Connect Instagram, view APIs, automation, multi-platform | Scale and automate. |

### Definition of "done" per phase

- **Phase 1 done:** Logged-in user (any role) can list campaigns, open one, and join; data in Supabase, RLS correct.
- **Phase 2 done:** Participant can submit; admin can approve/reject and set views; participant sees earnings and balance.
- **Phase 3 done:** Admin can create campaigns; creator can submit request; admin can approve and create campaign.
- **Phase 4 done:** User can request payout; admin can process; money can reach bank via Stripe.
- **Phase 5 done:** Verification flow exists; discovery and metrics in place; notifications working.
- **Phase 6:** Documented as "later"; implement when Phases 1–5 are live and stable.

### Where to track work

- Use this doc as the **single plan**: idea (Part 1), flows (Part 2), feature order (Part 3), execution (Part 4).
- Keep technical detail (schema, APIs, verification logic) in `PROJECT_OVERVIEW.md`.
- Tick off features in Part 3 as they ship (e.g. add "✅" next to each item when done).

---

## Quick reference

| Question | Answer |
|----------|--------|
| **What are we building?** | Content Reward platform (Whop-style): campaigns (UGC + Clipping), Instagram-only at first, submit → approve → earn per view → payout. |
| **What are the flows?** | Participant: discover → join → post → submit → [verify] → approval → earn → payout. Creator: request campaign → admin approves. Admin: create/fund campaign, review submissions, process payouts. |
| **What do we build first?** | Phase 1: Auth, roles, campaigns list/detail, join. Then Phase 2: submit, review, views/earnings. Then Phase 3: create campaign, creator requests. Then Phase 4: payouts, Stripe. Then Phase 5: verification, polish. |
| **Where is the full plan?** | This file: `docs/IDEA_FLOW_AND_PLAN.md`. Technical detail: `docs/PROJECT_OVERVIEW.md`. |
