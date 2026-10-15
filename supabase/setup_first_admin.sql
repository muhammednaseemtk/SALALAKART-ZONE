-- ==============================================================================
-- SALALAKART ZONE — SECURE SINGLE AUTHORIZED ADMINISTRATOR SETUP
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor).
--
-- This script enforces the following security guarantees:
-- 1. Grants the 'admin' role exclusively to the single authorized administrator account.
-- 2. Revokes the 'admin' role from ALL other accounts (if any exist).
-- 3. Deploys a security trigger preventing any other account from ever gaining admin status.
-- 4. Updates public.is_admin() to verify both the database role and authorized email.
-- 5. Outputs the authorized administrator's UUID for optional configuration in .env.
-- ==============================================================================

DO $$
DECLARE
  -- Replace with your configured admin email if different:
  target_email TEXT := 'admin@salalakartzone.com';
  target_user_id UUID;
  cleaned_count INT;
BEGIN
  -- Normalize email
  target_email := LOWER(TRIM(target_email));

  -- Step 1: Look up user in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE LOWER(email) = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE '--------------------------------------------------------------------------------';
    RAISE NOTICE 'ERROR: User "%" was not found in auth.users.', target_email;
    RAISE NOTICE 'Please create this account first in your Supabase Dashboard -> Authentication tab';
    RAISE NOTICE 'or register it on the website, then re-run this setup script.';
    RAISE NOTICE '--------------------------------------------------------------------------------';
    RETURN;
  END IF;

  -- Step 2: Ensure profile exists in public.profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (target_user_id, target_email, 'Store Administrator')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- Step 3: Revoke 'admin' role from ALL other accounts to guarantee single admin isolation
  WITH deleted AS (
    DELETE FROM public.user_roles
    WHERE role = 'admin' AND user_id <> target_user_id
    RETURNING id
  )
  SELECT COUNT(*) INTO cleaned_count FROM deleted;

  IF cleaned_count > 0 THEN
    RAISE NOTICE 'REVOKED: Removed admin role from % unauthorized user account(s).', cleaned_count;
  END IF;

  -- Step 4: Ensure the single authorized admin holds the 'admin' role
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE '--------------------------------------------------------------------------------';
  RAISE NOTICE 'SUCCESS: Single authorized administrator configured!';
  RAISE NOTICE 'Authorized Email: %', target_email;
  RAISE NOTICE 'Administrator UUID: %', target_user_id;
  RAISE NOTICE 'You may optionally set this in your .env file:';
  RAISE NOTICE 'VITE_ADMIN_USER_ID=%', target_user_id;
  RAISE NOTICE '--------------------------------------------------------------------------------';
END $$;

-- ==============================================================================
-- DATABASE LEVEL AUTHORIZATION ENFORCEMENT
-- ==============================================================================

-- 1. Helper function: public.is_admin()
-- Checks that caller holds 'admin' role in user_roles and belongs to authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN auth.users au ON au.id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
      AND LOWER(au.email) = LOWER(COALESCE(current_setting('app.settings.admin_email', true), 'admin@salalakartzone.com'))
  );
$$;

-- 2. Trigger function: Prevent any unauthorized user from being granted the 'admin' role
CREATE OR REPLACE FUNCTION public.enforce_single_authorized_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed_email TEXT := LOWER(COALESCE(current_setting('app.settings.admin_email', true), 'admin@salalakartzone.com'));
  u_email TEXT;
  existing_admin_count INT;
BEGIN
  IF NEW.role = 'admin' THEN
    SELECT LOWER(email) INTO u_email FROM auth.users WHERE id = NEW.user_id;
    
    IF u_email IS NULL OR u_email <> allowed_email THEN
      RAISE EXCEPTION 'Access Denied: Only the specifically authorized administrator account (%) can hold the admin role.', allowed_email;
    END IF;

    -- Ensure no other admin row exists in user_roles
    SELECT COUNT(*) INTO existing_admin_count
    FROM public.user_roles
    WHERE role = 'admin' AND user_id <> NEW.user_id;

    IF existing_admin_count > 0 THEN
      RAISE EXCEPTION 'Access Denied: SALALAKART ZONE strictly permits only ONE authorized administrator account.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_single_authorized_admin ON public.user_roles;
CREATE TRIGGER trg_enforce_single_authorized_admin
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_authorized_admin();
