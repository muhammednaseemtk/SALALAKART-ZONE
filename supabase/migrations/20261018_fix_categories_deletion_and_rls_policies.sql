-- ==============================================================================
-- SALALAKART ZONE — DATABASE MIGRATION
-- Migration: 20261018_fix_categories_deletion_and_rls_policies.sql
-- Description: 
--   1. Configure robust, granular Row Level Security (RLS) policies on public.categories:
--      - Public visitors and customers can SELECT active categories (or admins view all).
--      - Only authenticated administrators holding the 'admin' role in public.user_roles
--        can INSERT, UPDATE, or DELETE categories.
--   2. Ensure public.is_admin() helper function exists and is strictly SECURITY DEFINER.
--   3. Ensure public.categories table has REPLICA IDENTITY FULL and is in supabase_realtime
--      publication so that category deletions broadcast instantly to all connected clients.
-- ==============================================================================

-- 1. Ensure public.is_admin() helper function exists and is stable
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

-- 2. Ensure Row Level Security is active on public.categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Drop all previous or conflicting policies on public.categories
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Public view active categories or admin view all" ON public.categories;
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins delete categories" ON public.categories;

-- 4. Granular Policies on public.categories

-- Policy A: SELECT — Public reads active categories; Admins read all
CREATE POLICY "Public view active categories or admin view all"
  ON public.categories
  FOR SELECT
  USING (is_active = true OR public.is_admin());

-- Policy B: INSERT — Only verified administrators can create categories
CREATE POLICY "Admins insert categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Policy C: UPDATE — Only verified administrators can update categories
CREATE POLICY "Admins update categories"
  ON public.categories
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy D: DELETE — Only verified administrators can delete categories
CREATE POLICY "Admins delete categories"
  ON public.categories
  FOR DELETE
  USING (public.is_admin());

-- 5. Enable Realtime publication for categories table
ALTER TABLE public.categories REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  END IF;
END $$;

-- 6. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
