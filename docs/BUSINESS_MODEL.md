## Clixyo s Business Model

### 1. Roles

- **Creator**: Brand or creator who wants UGC clips for their product/campaign.
- **Clipper**: Person who joins campaigns and creates clips/reels to earn money from views.
- **Admin**: Platform operator who reviews campaigns and manages payouts / disputes.

### 2. High-level Flow

1. **Creator creates a campaign (Draft → Submitted)**  
   - Fills in campaign details (title, description, requirements, platforms, dates, total budget, reward rate per 1K views, min/max payout, etc.).
   - Submits campaign for review.

2. **Admin reviews campaign (Submitted → Approved / Rejected)**  
   - Admin checks content, budget, and rate-per-1K views.
   - If rejected, creator sees reason and can edit & resubmit.
   - If approved, campaign enters **Approved – Awaiting Payment** state.

3. **Creator pays to fund the campaign (Approved – Awaiting Payment → Live)**  
   - Creator sees a **“Pay & Go Live”** screen for that campaign.
   - Payment options: initially UPI / GPay (can add more later).
   - Once payment is confirmed:
     - Campaign status becomes **Live**.
     - `funded_amount` for the campaign is set (usually equals `total_budget`).
     - This amount is locked for clipper payouts.

4. **Clipper joins and submits content (Live campaigns only)**  
   - Clippers can only see/join **Live** campaigns that:
     - Are within date range.
     - Have remaining budget.
   - Clipper joins a campaign and submits one or more reels/links according to requirements.
   - Creator/admin reviews submissions, and on **approval**:
     - We capture **baseline views** via SocialKit.
     - Submission becomes eligible for ongoing view tracking.

5. **Views tracking and earnings (automated, every 6 hours)**  
   - Cron job runs ~every 6 hours:
     - For each approved submission, fetches the latest views from SocialKit.
     - Saves a new snapshot and updates:
       - `latest_views`
       - `view_count` (views gained over baseline)
       - `earnings` = f(view_count, rate_per_1k, min/max payout rules)
   - Creator’s campaign budget is reduced as earnings accumulate for clippers.

6. **Clipper wallet and withdrawals**  
   - Each clipper has a **wallet balance** that is the sum of earnings from all their approved submissions (across campaigns), capped by each campaign’s max payout rules.
   - Clipper can **request withdrawal only when balance ≥ ₹2,000**:
     - Below ₹2,000, the withdrawal button is disabled with a clear message.
   - Payout methods:
     - UPI / GPay details are stored in the clipper’s profile.
     - Admin sees withdrawal requests and marks them as **Paid** after sending the money manually (or via future payment integration).

7. **Campaign completion and leftover budget**

- A campaign is considered **Completed** when:
  - End date has passed **or**
  - `funded_amount` is fully allocated to clippers (reached max total payouts).
- Leftover budget handling (to be finalized):
  - Option A: Refund remaining amount to the creator.
  - Option B: Keep credit in a creator wallet for future campaigns.

### 3. Campaign Status Model (for implementation)

- **draft**: Creator editing; not submitted.
- **submitted**: Creator requested review; visible only to admin.
- **rejected**: Admin rejected; requires changes and resubmission.
- **approved_awaiting_payment**: Approved by admin; payment required before going live.
- **live**: Payment done; clippers can join and submit.
- **completed**: Campaign finished (date over or budget used).

These statuses control:

- Visibility on **Explore / Joined** pages for clippers.
- Whether **submission** is allowed.
- Whether **cron-based view tracking** and payout accrual are active.

### 4. Money & Fees (current assumptions)

- **Currency**: All amounts are in Indian Rupees (₹).
- **Payment in**: Creator pays full campaign budget up front when going live.
- **Payment out**: Clippers are paid based on:
  - Views gained after approval (baseline → latest).
  - Campaign-specific rate per 1K views.
  - Campaign’s min and max payout caps.
- **Platform fee** (to define later):
  - Option A: Include fee inside reward rate / budget (creator-side).
  - Option B: Deduct small % from each clipper payout.

### 5. Open Questions / To Decide

- Exact formula for **earnings per view** and how we round amounts.
- Final rules for **leftover budget** (refund vs. carry-forward credit).
- Whether creators can **top up** an active campaign if budget is running low.
- How disputes are handled if a creator claims views are invalid or content breaks rules.

This document is the source of truth for product/business decisions; implementation (DB fields, APIs, UI) should follow this model.

