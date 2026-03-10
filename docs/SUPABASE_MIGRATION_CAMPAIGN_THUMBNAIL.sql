-- Add thumbnail_url to campaigns for campaign card thumbnails
-- Run this in Supabase: Dashboard → SQL Editor

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

