-- ==============================================================================
-- SALALAKART ZONE — SECURE ADMIN PASSWORD RESET PROCEDURE
-- ==============================================================================
-- Use this script in the Supabase SQL Editor if your administrator password
-- is forgotten, incorrect, or unknown.
-- ==============================================================================

-- PROCEDURE 1: Update Password Directly via PostgreSQL pgcrypto (Instant)
-- Replace 'admin@salalakartzone.com' and 'YourNewAdminPassword123!' with your desired credentials:

DO $$
DECLARE
  target_email TEXT := 'admin@salalakartzone.com';
  new_password TEXT := 'YourNewAdminPassword123!';
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Target user with email "%" does not exist in auth.users. Please create it in the Supabase Dashboard Authentication tab first.', target_email;
  ELSE
    -- 1. Update encrypted password with standard bcrypt blowfish hash
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW(),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = target_user_id;

    -- 2. Ensure admin role is granted in public.user_roles
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'SUCCESS: Password for % has been securely reset and administrator privileges confirmed.', target_email;
  END IF;
END $$;

-- PROCEDURE 2: Self-Service Password Reset via Email
-- 1. Navigate to http://localhost:5173/admin/login
-- 2. Click "Forgot Password?"
-- 3. Enter your administrator email address
-- 4. Supabase Auth will dispatch a secure recovery token link to your inbox.
