## Clixyo s Payment Flow — Implementation Plan

### Overview

This document covers the full money flow: creator pays for a campaign via Razorpay, clippers earn from views, and clippers withdraw earnings to their UPI.

---

### 1. Database Changes

#### A. Update `campaigns` table — new columns

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `admin_approved_at` | timestamptz | null | When admin approved the campaign |
| `admin_rejected_reason` | text | null | Reason if admin rejected |
| `amount_paid` | numeric | 0 | Amount creator paid via Razorpay |
| `razorpay_order_id` | text | null | Razorpay order ID for this campaign |
| `razorpay_payment_id` | text | null | Razorpay payment ID after successful payment |
| `campaign_spent` | numeric | 0 | Total earnings paid out to clippers from this campaign |

#### Campaign status values

| Status | Meaning |
|--------|---------|
| `pending_review` | Creator submitted, waiting for admin review |
| `rejected` | Admin rejected (with reason) |
| `awaiting_payment` | Admin approved, creator must pay to activate |
| `live` | Creator paid, visible to clippers in Explore |
| `paused` | Creator paused manually |
| `completed` | Budget exhausted or end_date passed |

#### B. New table: `payout_details`

Stores clipper's withdrawal info (UPI for MVP).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → users) | |
| `method` | text | "upi" for MVP |
| `upi_id` | text | e.g. "name@upi" |
| `is_default` | boolean | default true |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### C. New table: `payout_requests`

Clipper withdrawal requests.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → users) | |
| `amount` | numeric | |
| `status` | text | "pending" / "processing" / "paid" / "rejected" |
| `payout_detail_id` | uuid (FK → payout_details) | Which UPI was used |
| `admin_note` | text | nullable — reason if rejected |
| `transaction_ref` | text | nullable — UTR / Razorpay payout ID |
| `requested_at` | timestamptz | |
| `processed_at` | timestamptz | nullable |

#### D. Add wallet fields to `users` table

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `total_earned` | numeric | 0 | Lifetime earnings across all campaigns |
| `total_withdrawn` | numeric | 0 | Total amount successfully paid out |
| `pending_withdrawal` | numeric | 0 | Amount currently in pending payout requests |

**Computed (not stored):** `available_balance = total_earned - total_withdrawn - pending_withdrawal`

---

### 2. Razorpay Integration (Creator Pays for Campaign)

#### Environment variables

```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

#### API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/razorpay/create-order` | POST | Takes `campaignId`, creates Razorpay order for the campaign budget, returns `orderId` + `amount` |
| `/api/razorpay/verify-payment` | POST | Takes `orderId`, `paymentId`, `signature`, verifies Razorpay HMAC signature, marks campaign as `live` |

#### Frontend flow

1. Creator sees campaign with status `awaiting_payment`.
2. Clicks **"Activate & Pay ₹XX,XXX"**.
3. Frontend calls `POST /api/razorpay/create-order` → gets `orderId`.
4. Opens **Razorpay Checkout** popup (client-side JS via `<script src="https://checkout.razorpay.com/v1/checkout.js">`).
5. On payment success callback, frontend calls `POST /api/razorpay/verify-payment` with `{ orderId, paymentId, signature }`.
6. Backend verifies HMAC → sets `campaign.status = "live"`, stores `razorpay_order_id`, `razorpay_payment_id`, `amount_paid`.

---

### 3. Campaign Approval Flow

#### Creator side

- **Create campaign** → saves as `status = "pending_review"` (NOT live).
- **My Campaigns page** shows status badges:
  - `pending_review` → "Under review" (yellow badge)
  - `rejected` → "Rejected: {reason}" (red badge)
  - `awaiting_payment` → "Approved — Pay to activate" (blue badge) + **Pay button**
  - `live` → "Live" (green badge)
  - `completed` → "Completed" (gray badge)

#### Admin side

- **New tab in admin dashboard: "Campaign Requests"**
- Table of `pending_review` campaigns.
- Columns: title, creator name/email, budget, rate per 1K, dates.
- Actions: **Approve** (→ `awaiting_payment`) / **Reject** (→ `rejected` + reason input).

#### Explore page (clippers)

- Only fetches campaigns where `status = 'live'`.

---

### 4. Clipper Wallet

#### New sidebar item: "Wallet" (clippers only)

#### Wallet page shows:

- **Available balance**: `total_earned - total_withdrawn - pending_withdrawal`
- **Pending payouts**: sum of pending payout requests
- **Total earned** (lifetime)
- **Total withdrawn** (lifetime)

#### Payout history table:

| Column | Shows |
|--------|-------|
| Date | `requested_at` |
| Amount | `₹X,XXX` |
| Status | pending / processing / paid / rejected |
| Reference | transaction_ref (if paid) |
| Note | admin_note (if rejected) |

#### "Request Payout" button:

- **Disabled** if `available_balance < ₹2,000` (with tooltip: "Minimum ₹2,000 required").
- Opens modal:
  - Amount input (min ₹2,000, max available_balance).
  - Shows saved UPI ID (or prompts to set one first).
  - Confirm → `POST /api/wallet/request-payout`.
  - Creates `payout_request` with `status = "pending"`.
  - Increases `users.pending_withdrawal` by the amount.

#### Payout details setup:

- In Wallet page or Profile → "Payment Details" section.
- Input: UPI ID (e.g. `name@upi`).
- Save → stored in `payout_details` table.

#### API routes:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/wallet/balance` | GET | Returns earned / withdrawn / pending / available |
| `/api/wallet/request-payout` | POST | Creates payout request, updates pending_withdrawal |
| `/api/wallet/payout-history` | GET | Returns list of payout requests for the user |
| `/api/wallet/save-payout-details` | POST | Save/update UPI ID |
| `/api/wallet/get-payout-details` | GET | Get saved payout details |

---

### 5. Admin Payout Management

#### New tab in admin dashboard: "Payouts"

#### Table columns:

| Column | Source |
|--------|--------|
| Clipper name / email | `users` join |
| Amount | `payout_requests.amount` |
| UPI ID | `payout_details.upi_id` |
| Requested on | `payout_requests.requested_at` |
| Status | pending / processing / paid / rejected |

#### Actions (for pending requests):

- **"Mark as Paid"**: Admin enters transaction reference (UTR / ID) → `status = "paid"`, `processed_at = now()`, increase `users.total_withdrawn`, decrease `users.pending_withdrawal`.
- **"Reject"**: Admin enters reason → `status = "rejected"`, `processed_at = now()`, decrease `users.pending_withdrawal` (amount returns to available balance).

#### API routes:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/payout-requests` | GET | List all requests with status filter |
| `/api/admin/payout-requests/[id]/pay` | POST | Mark as paid + transaction ref |
| `/api/admin/payout-requests/[id]/reject` | POST | Reject + reason |

---

### 6. Earnings Sync (Update Existing Cron)

When the cron job (`/api/cron/fetch-views`) or manual refresh (`/api/views/refresh-single`) updates a submission's earnings:

1. Calculate the **earnings delta** (new earnings - old earnings for that submission).
2. Add delta to `users.total_earned` for the clipper.
3. Add delta to `campaigns.campaign_spent`.
4. If `campaign_spent >= amount_paid`:
   - Set `campaign.status = "completed"`.
   - Stop tracking views for that campaign's submissions.

---

### 7. Build Order

| Step | What | Depends on |
|------|------|------------|
| 1 | SQL migration (all new tables + columns) | Nothing |
| 2 | Install Razorpay + create-order / verify-payment API routes | Step 1 |
| 3 | Update campaign creation to save as `pending_review` | Step 1 |
| 4 | Admin campaign review tab (approve / reject) | Step 1 |
| 5 | Creator payment activation UI (Razorpay Checkout) | Steps 2, 4 |
| 6 | Update Explore to show only `live` campaigns | Step 3 |
| 7 | Clipper wallet page + payout details setup | Step 1 |
| 8 | Clipper request payout flow | Step 7 |
| 9 | Admin payout management tab | Step 8 |
| 10 | Update cron/refresh to sync `total_earned` + `campaign_spent` | Step 1 |

---

### 8. RLS Policies (Key Rules)

- **payout_details**: Users can only read/write their own rows.
- **payout_requests**: Users can read their own; admins can read all. Only system (service role) can update status.
- **campaigns**: Clippers can only SELECT where `status = 'live'`. Creators can SELECT their own campaigns in any status.
- **Wallet fields on users**: Users can only read their own. Only service role can update `total_earned`, `total_withdrawn`, `pending_withdrawal`.

---

### 9. Security Notes

- Razorpay signature verification happens **server-side only** (never trust the client).
- Wallet balance updates happen **server-side only** via `supabaseAdmin` (service role), never from client-side Supabase.
- `pending_withdrawal` prevents double-requesting the same funds.
- Admin-only routes check `user.role === "admin"` before processing.
