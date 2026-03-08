-- Add profile fields to users table for General settings.
-- Run in Supabase: Dashboard → SQL Editor
-- (first_name, last_name, email already exist from Phase 1)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;
