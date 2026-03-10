-- Payment Flow Migration (Phase 1)
-- Run in Supabase: Dashboard → SQL Editor → New query
-- Run AFTER all previous migrations (users, campaigns, submissions, view_snapshots)

-- ============================================================
-- 1. UPDATE CAMPAIGNS TABLE — new columns + new status values
-- ============================================================

-- Drop existing status CHECK constraint so we can widen the allowed values
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- Add new CHECK with all status values
ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_status_check
  CHECK (status IN (
    'draft',
    'pending_review',
    'rejected',
    'awaiting_payment',
    'live',
    'paused',
    'completed',
    -- keep old values for backward compatibility during migration
    'active',
    'pending_budget',
    'ended'
  ));

-- Migrate existing rows: 'active' → 'live', 'ended' → 'completed'
UPDATE public.campaigns SET status = 'live' WHERE status = 'active';
UPDATE public.campaigns SET status = 'completed' WHERE status = 'ended';

-- Add new columns
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_rejected_reason TEXT,
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS campaign_spent NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- ============================================================
-- 2. UPDATE USERS TABLE — wallet fields
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS total_earned NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_withdrawn NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_withdrawal NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- ============================================================
-- 3. NEW TABLE: payout_details (clipper's UPI / bank info)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payout_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'upi' CHECK (method IN ('upi', 'bank')),
  upi_id TEXT,
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_details_user_id ON public.payout_details(user_id);

CREATE TRIGGER payout_details_updated_at
  BEFORE UPDATE ON public.payout_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: Users can only access their own payout details
ALTER TABLE public.payout_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payout details"
  ON public.payout_details FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payout details"
  ON public.payout_details FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payout details"
  ON public.payout_details FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own payout details"
  ON public.payout_details FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 4. NEW TABLE: payout_requests (clipper withdrawal requests)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'rejected')),
  payout_detail_id UUID REFERENCES public.payout_details(id) ON DELETE SET NULL,
  admin_note TEXT,
  transaction_ref TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON public.payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);

-- RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Clippers can read their own payout requests
CREATE POLICY "Users can read own payout requests"
  ON public.payout_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Clippers can insert their own payout requests
CREATE POLICY "Users can insert own payout requests"
  ON public.payout_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can read all payout requests
CREATE POLICY "Admins can read all payout requests"
  ON public.payout_requests FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Admins can update payout requests (mark paid / reject)
CREATE POLICY "Admins can update payout requests"
  ON public.payout_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 5. UPDATE CAMPAIGNS RLS — clippers see 'live' instead of 'active'
-- ============================================================

-- Drop old Explore policy that checks for 'active'
DROP POLICY IF EXISTS "Authenticated can read active campaigns" ON public.campaigns;

-- New policy: clippers see only 'live' campaigns
CREATE POLICY "Authenticated can read live campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (status = 'live');

-- ============================================================
-- 6. ADMINS CAN READ USERS (for payout management)
-- ============================================================

-- Allow admins to read any user row (for wallet balances, names in payout tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Admins can read all users'
  ) THEN
    CREATE POLICY "Admins can read all users"
      ON public.users FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));
  END IF;
END
$$;
