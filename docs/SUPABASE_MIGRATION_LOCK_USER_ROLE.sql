-- Migration: Prevent non-admins from changing public.users.role
-- Run this in Supabase SQL Editor AFTER Phase 1 has been applied.
--
-- Why: Many app decisions rely on users.role (admin checks, RLS policies).
--      If a normal user can update role, they can self-promote to admin.

-- 1) Trigger function to block role changes unless caller is admin.
CREATE OR REPLACE FUNCTION public.prevent_users_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- If role isn't changing, allow.
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Allow a one-time self-selection during onboarding:
  -- clipper -> clipper/creator while onboarding_done flips to true.
  IF auth.uid() = OLD.id
     AND OLD.onboarding_done = false
     AND NEW.onboarding_done = true
     AND OLD.role = 'clipper'
     AND NEW.role IN ('clipper', 'creator') THEN
    RETURN NEW;
  END IF;

  -- Allow service role / privileged callers (auth.uid() is NULL in many server contexts).
  -- If you want to strictly require an authenticated admin even for server routes, remove this.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  )
  INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Forbidden: cannot change role';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_prevent_role_change ON public.users;
CREATE TRIGGER users_prevent_role_change
  BEFORE UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_users_role_change();

-- 2) Optional hardening: remove column update privilege for authenticated users.
-- This is defense-in-depth so even buggy RLS doesn't permit role updates.
-- Note: Supabase typically grants privileges to roles like authenticated/anon.
REVOKE UPDATE (role) ON TABLE public.users FROM authenticated;

