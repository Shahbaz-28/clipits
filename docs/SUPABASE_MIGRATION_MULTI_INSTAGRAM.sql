-- ============================================================
-- Migration: Multiple Instagram Accounts per Clipper
-- ============================================================

-- 1. Create the user_instagram_accounts table
CREATE TABLE IF NOT EXISTS public.user_instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  verification_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_default BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_user_instagram_accounts_user_id
  ON public.user_instagram_accounts(user_id);

-- RLS
ALTER TABLE public.user_instagram_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ig accounts"
  ON public.user_instagram_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own ig accounts"
  ON public.user_instagram_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ig accounts"
  ON public.user_instagram_accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own ig accounts"
  ON public.user_instagram_accounts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all ig accounts
CREATE POLICY "Admins can read all ig accounts"
  ON public.user_instagram_accounts FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 2. Add instagram_account_id to submissions table
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS instagram_account_id UUID REFERENCES public.user_instagram_accounts(id);

-- 3. Migrate existing verified accounts from users table into user_instagram_accounts
-- (Run only once – idempotent via ON CONFLICT if you add a unique constraint)
INSERT INTO public.user_instagram_accounts (user_id, username, verified_at, is_default)
SELECT id, instagram_username, instagram_verified_at, true
FROM public.users
WHERE instagram_username IS NOT NULL AND instagram_verified_at IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. (Optional) After confirming migration, you can drop old columns from users:
-- ALTER TABLE public.users DROP COLUMN IF EXISTS instagram_username;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS instagram_verified_at;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS instagram_verification_code;
