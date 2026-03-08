-- View snapshots for tracking reel view growth over time.
-- Run in Supabase: Dashboard → SQL Editor

-- 1. Snapshot table
CREATE TABLE IF NOT EXISTS public.view_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  views INTEGER NOT NULL DEFAULT 0,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_view_snapshots_submission_id ON public.view_snapshots(submission_id);
CREATE INDEX IF NOT EXISTS idx_view_snapshots_captured_at ON public.view_snapshots(captured_at);

-- 2. Add baseline_views and latest_views to submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS baseline_views INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS latest_views INTEGER NOT NULL DEFAULT 0;

-- 3. RLS for view_snapshots
ALTER TABLE public.view_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can read snapshots for their own submissions
CREATE POLICY "Users can read own snapshots"
  ON public.view_snapshots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = view_snapshots.submission_id
        AND s.user_id = auth.uid()
    )
  );

-- Creators can read snapshots for submissions on their campaigns
CREATE POLICY "Creators can read snapshots for own campaigns"
  ON public.view_snapshots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.campaigns c ON c.id = s.campaign_id
      WHERE s.id = view_snapshots.submission_id
        AND c.created_by = auth.uid()
    )
  );

-- Service role (cron) can insert snapshots (no RLS restriction needed for service_role)
-- The cron uses the service role key which bypasses RLS.
