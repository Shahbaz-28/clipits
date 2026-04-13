-- Extra waitlist survey fields (run after SUPABASE_MIGRATION_WAITLIST.sql).

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS creator_monthly_spend TEXT,
  ADD COLUMN IF NOT EXISTS creator_content_type TEXT,
  ADD COLUMN IF NOT EXISTS clipper_clipped_before TEXT;
