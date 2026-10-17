-- ==============================================================================
-- SALALAKART ZONE — DATABASE MIGRATION
-- Migration: 20261017_fix_customer_registration_and_profiles.sql
-- Description: 
--   1. Automatically sync all newly registered customer accounts from auth.users 
--      to public.profiles and public.user_roles via a secure database trigger.
--   2. Backfill existing registered auth.users into public.profiles & user_roles.
--   3. Configure granular Row Level Security (RLS) policies on public.profiles.
--   4. Enable Supabase Realtime CDC publication on public.profiles so new customer
--      registrations instantly reflect in the Admin Customers directory.
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

-- 2. Configure Row Level Security (RLS) on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile or admin read all" ON public.profiles;
CREATE POLICY "Users read own profile or admin read all"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 3. Configure Row Level Security (RLS) on public.user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
CREATE POLICY "Users read own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can insert or update user_roles" ON public.user_roles;
CREATE POLICY "Only admins can insert or update user_roles"
  ON public.user_roles
  FOR ALL
  USING (public.is_admin());

-- 4. Create Automatic Customer Profile & Role Trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
  v_role TEXT;
BEGIN
  -- Extract customer details from registration metadata
  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(NEW.email, '@', 1)
  );
  v_phone := COALESCE(TRIM(NEW.raw_user_meta_data->>'phone'), '');

  -- Determine initial role
  IF LOWER(NEW.email) = 'admin@salalakartzone.com' THEN
    v_role := 'admin';
  ELSE
    v_role := 'customer';
  END IF;

  -- Create or update customer profile in public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_phone,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.created_at, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name != '' THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    phone = CASE 
      WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone != '' THEN EXCLUDED.phone 
      ELSE public.profiles.phone 
    END,
    updated_at = NOW();

  -- Assign default user role in public.user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Prevent authentication failure if secondary table operations encounter an issue
  RAISE WARNING 'handle_new_user exception: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill existing auth.users into public.profiles and public.user_roles
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  phone,
  avatar_url,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  COALESCE(
    NULLIF(TRIM(raw_user_meta_data->>'full_name'), ''),
    split_part(email, '@', 1)
  ),
  COALESCE(TRIM(raw_user_meta_data->>'phone'), ''),
  COALESCE(raw_user_meta_data->>'avatar_url', ''),
  created_at,
  COALESCE(updated_at, created_at)
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = CASE 
    WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name != '' THEN EXCLUDED.full_name 
    ELSE public.profiles.full_name 
  END,
  phone = CASE 
    WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone != '' THEN EXCLUDED.phone 
    ELSE public.profiles.phone 
  END;

INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE WHEN LOWER(email) = 'admin@salalakartzone.com' THEN 'admin' ELSE 'customer' END
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Enable PostgreSQL Realtime Publication & REPLICA IDENTITY FULL for instant CDC updates
ALTER TABLE IF EXISTS public.profiles REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.user_roles REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_roles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
  END IF;
END $$;

-- 7. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
