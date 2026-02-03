-- Migration: Ensure campaigns has requirements and assets columns
-- Run in Supabase: Dashboard → SQL Editor → New query
-- Use this if your campaigns table was created without these columns (e.g. older schema).

-- Add requirements (JSONB array of strings) if missing
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS requirements JSONB NOT NULL DEFAULT '[]';

-- Add assets (JSONB array of { name, link }) if missing
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS assets JSONB NOT NULL DEFAULT '[]';
