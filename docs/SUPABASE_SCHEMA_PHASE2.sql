-- Phase 2: Campaigns + user_campaigns (join)
-- Run this AFTER Phase 1 (users table must exist).
-- In Supabase: Dashboard → SQL Editor → New query

-- 1. Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('ugc', 'clipping')),
  category TEXT,
  total_budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
  rate_per_1k NUMERIC(10, 2) NOT NULL,
  min_payout NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_payout NUMERIC(10, 2) NOT NULL,
  flat_fee_bonus NUMERIC(10, 2) DEFAULT 0,
  platforms JSONB NOT NULL DEFAULT '["instagram"]',
  requirements JSONB NOT NULL DEFAULT '[]',
  assets JSONB NOT NULL DEFAULT '[]',
  disclaimer TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_budget', 'active', 'ended')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ
);

-- 2. user_campaigns (who joined which campaign)
CREATE TABLE IF NOT EXISTS public.user_campaigns (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, campaign_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_user_campaigns_user_id ON public.user_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_campaigns_campaign_id ON public.user_campaigns(campaign_id);

-- 4. campaigns updated_at trigger
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. RLS: campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active campaigns (Explore)
CREATE POLICY "Authenticated can read active campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Creators can read campaigns they created
CREATE POLICY "Creators can read own campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('creator', 'admin'))
  );

-- Admins can read all campaigns
CREATE POLICY "Admins can read all campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Admins and creators (own only) can insert/update (Phase 3 will refine creator request flow)
CREATE POLICY "Admins can insert campaigns"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Creators can insert their own campaigns (e.g. as draft; admin can set to active)
CREATE POLICY "Creators can insert own campaigns"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'creator')
  );

CREATE POLICY "Admins can update campaigns"
  ON public.campaigns FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Creators can update their own campaigns (e.g. publish draft → active so it appears in Explore)
CREATE POLICY "Creators can update own campaigns"
  ON public.campaigns FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'creator')
  );

-- 6. RLS: user_campaigns
ALTER TABLE public.user_campaigns ENABLE ROW LEVEL SECURITY;

-- Users can read their own joins
CREATE POLICY "Users can read own user_campaigns"
  ON public.user_campaigns FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can join a campaign (insert own row)
CREATE POLICY "Users can join campaign"
  ON public.user_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Optional: seed one active campaign for testing (replace CREATOR_OR_ADMIN_UUID with a real users.id or leave NULL)
-- INSERT INTO public.campaigns (title, description, type, category, total_budget, rate_per_1k, min_payout, max_payout, platforms, requirements, assets, status)
-- VALUES (
--   'Summer Fashion Haul',
--   'Create engaging content showcasing the latest summer fashion trends.',
--   'ugc',
--   'E-commerce',
--   5000,
--   2.00,
--   50,
--   2000,
--   '["instagram"]',
--   '["Must be high-quality edits", "Tag our profile + follow", "English only"]',
--   '[]',
--   'active'
-- );
