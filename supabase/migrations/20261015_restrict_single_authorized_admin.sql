-- ==============================================================================
-- SALALAKART ZONE — MIGRATION: RESTRICT ADMIN TO ONE AUTHORIZED ACCOUNT
-- ==============================================================================
-- Target: Supabase / PostgreSQL 15+
-- ==============================================================================

-- 1. Tighten public.is_admin() helper function
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

-- 2. Trigger function to enforce that only ONE authorized administrator account can exist
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

-- 3. Revoke admin role from any accounts that do not match the authorized admin email
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (
    SELECT id FROM auth.users WHERE LOWER(email) = LOWER(COALESCE(current_setting('app.settings.admin_email', true), 'admin@salalakartzone.com'))
  );
