-- Phase 3: Submissions (content links from clippers for review + views/earnings)
-- Run AFTER Phase 1 and Phase 2 (users, campaigns, user_campaigns must exist).
-- In Supabase: Dashboard → SQL Editor → New query

-- 1. Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_link TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'instagram' CHECK (platform IN ('instagram', 'youtube', 'tiktok')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  view_count INTEGER NOT NULL DEFAULT 0,
  earnings NUMERIC(12, 2) NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_campaign_id ON public.submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- 3. updated_at trigger (reuse existing function)
CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Clippers can insert own submission only if they joined the campaign
CREATE POLICY "Users can insert own submission if joined"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_campaigns
      WHERE user_id = auth.uid() AND campaign_id = submissions.campaign_id
    )
  );

-- Users can read their own submissions
CREATE POLICY "Users can read own submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Creators can read submissions for campaigns they created
CREATE POLICY "Creators can read submissions for own campaigns"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = submissions.campaign_id
        AND c.created_by = auth.uid()
        AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('creator', 'admin'))
    )
  );

-- Admins can read all submissions
CREATE POLICY "Admins can read all submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Creators can update (approve/reject/set views) submissions for their campaigns
CREATE POLICY "Creators can update submissions for own campaigns"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = submissions.campaign_id AND c.created_by = auth.uid()
        AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('creator', 'admin'))
    )
  );

-- Admins can update any submission
CREATE POLICY "Admins can update submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
