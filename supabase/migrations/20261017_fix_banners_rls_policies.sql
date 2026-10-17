-- ==============================================================================
-- SALALAKART ZONE — DATABASE MIGRATION
-- Migration: 20261017_fix_banners_rls_policies.sql
-- Description: Configure granular Row Level Security (RLS) policies on public.banners
--              allowing public visitors to read active banners and authorized
--              administrators to perform INSERT, UPDATE, and DELETE operations.
-- ==============================================================================

-- 1. Ensure public.is_admin() exists and reliably checks administrator role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2. Ensure the authorized administrator account holds the 'admin' role in public.user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE LOWER(email) = 'admin@salalakartzone.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Ensure Row Level Security is enabled on public.banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing or conflicting policies on public.banners
DROP POLICY IF EXISTS "Public view active banners" ON public.banners;
DROP POLICY IF EXISTS "Public view active banners or admin view all" ON public.banners;
DROP POLICY IF EXISTS "Admins manage banners" ON public.banners;
DROP POLICY IF EXISTS "Admins insert banners" ON public.banners;
DROP POLICY IF EXISTS "Admins update banners" ON public.banners;
DROP POLICY IF EXISTS "Admins delete banners" ON public.banners;

-- 5. Policy: Public visitors read only active banners, while authorized admins can view all
CREATE POLICY "Public view active banners or admin view all"
  ON public.banners
  FOR SELECT
  USING (is_active = true OR public.is_admin());

-- 6. Policy: Authorized administrators can insert new banners
CREATE POLICY "Admins insert banners"
  ON public.banners
  FOR INSERT
  WITH CHECK (public.is_admin());

-- 7. Policy: Authorized administrators can update banners (covers both USING and WITH CHECK)
CREATE POLICY "Admins update banners"
  ON public.banners
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. Policy: Authorized administrators can delete banners
CREATE POLICY "Admins delete banners"
  ON public.banners
  FOR DELETE
  USING (public.is_admin());

-- 9. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
