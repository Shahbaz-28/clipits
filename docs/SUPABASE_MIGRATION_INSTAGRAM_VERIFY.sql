-- Add Instagram verification fields to users table.
-- Run in Supabase: Dashboard → SQL Editor

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS instagram_verification_code TEXT,
  ADD COLUMN IF NOT EXISTS instagram_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS instagram_username TEXT;
