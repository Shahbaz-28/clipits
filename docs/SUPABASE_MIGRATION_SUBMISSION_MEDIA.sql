-- Add media_url to submissions so creator can see the uploaded media file.
-- Run in Supabase: Dashboard → SQL Editor

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Storage bucket (create in Dashboard → Storage):
-- 1. New bucket, name: submission-media
-- 2. Set to Public (so creators can view media via public URL)
-- 3. Add policy: "Allow authenticated uploads" – INSERT for authenticated with path template like campaign_id/user_id/*
--    Or use "Allow all authenticated uploads" for bucket submission-media (INSERT) for role authenticated.
