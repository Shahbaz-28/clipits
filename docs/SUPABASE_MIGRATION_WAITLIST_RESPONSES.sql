-- Add survey answers to waitlist_signups (run after SUPABASE_MIGRATION_WAITLIST.sql).
-- Dashboard → SQL Editor → Run once.

ALTER TABLE public.waitlist_signups
ADD COLUMN IF NOT EXISTS responses JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.waitlist_signups.responses IS
  'Role-specific answers: creator { monthly_spend, content_type }; clipper { clipped_before, knows_editing }.';
