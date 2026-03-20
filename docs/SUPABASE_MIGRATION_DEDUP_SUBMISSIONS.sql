-- Migration: Prevent duplicate submissions for same campaign + link
-- Run this after Phase 3 (submissions) exists.
--
-- Goal: block "submit same reel multiple times" farming in the same campaign.
--
-- NOTE: If you already have duplicates, this will fail to create.
--       De-dupe existing data first, then re-run.

-- 1) (Optional) Inspect duplicates before applying
-- SELECT campaign_id, content_link, COUNT(*)
-- FROM public.submissions
-- GROUP BY campaign_id, content_link
-- HAVING COUNT(*) > 1;

-- 2) Add uniqueness constraint via unique index
CREATE UNIQUE INDEX IF NOT EXISTS uniq_submissions_campaign_link
  ON public.submissions (campaign_id, content_link);

