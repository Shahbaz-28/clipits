-- Waitlist signups (Rippl early access).
-- Run in Supabase: Dashboard → SQL Editor → New query → Run.
-- Inserts happen only via Next.js API using SUPABASE_SERVICE_ROLE_KEY.

CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('clipper', 'creator')),
  creator_monthly_spend TEXT,
  creator_content_type TEXT,
  clipper_clipped_before TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_signups_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_signups_created_at ON public.waitlist_signups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_role ON public.waitlist_signups(role);

COMMENT ON TABLE public.waitlist_signups IS 'Marketing waitlist; written by server only.';

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- No policies: clients cannot read/write. Service role bypasses RLS for API inserts.
