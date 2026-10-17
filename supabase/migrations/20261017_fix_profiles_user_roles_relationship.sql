-- ==============================================================================
-- SALALAKART ZONE — DATABASE MIGRATION
-- Migration: 20261017_fix_profiles_user_roles_relationship.sql
-- Description: Establishes explicit foreign key relationship between public.profiles
--              and public.user_roles to resolve PostgREST PGRST200 schema cache error.
-- ==============================================================================

-- 1. Ensure any existing user_roles records have a corresponding profile entry
--    This guarantees referential integrity without dropping or deleting data.
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
  ur.user_id,
  COALESCE(u.email, 'user_' || SUBSTRING(ur.user_id::text, 1, 8) || '@salalakartzone.com'),
  COALESCE(u.raw_user_meta_data->>'full_name', 'Customer'),
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT user_id FROM public.user_roles
) ur
LEFT JOIN auth.users u ON u.id = ur.user_id
WHERE ur.user_id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 2. Deduplicate user_roles if any duplicate (user_id, role) exists before constraint
DELETE FROM public.user_roles a
USING public.user_roles b
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND a.role = b.role;

-- 3. Safely establish foreign key constraint from user_roles.user_id to public.profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user_roles_profiles' 
      AND table_schema = 'public' 
      AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT fk_user_roles_profiles
      FOREIGN KEY (user_id) REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Create index on foreign key to optimize joins between profiles and user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_fk ON public.user_roles(user_id);

-- 5. Notify PostgREST to reload schema cache immediately
NOTIFY pgrst, 'reload schema';
