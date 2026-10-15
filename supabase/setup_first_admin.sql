-- ==============================================================================
-- SALALAKART ZONE — SECURE FIRST ADMINISTRATOR SETUP SCRIPT
-- Run this in the Supabase Dashboard SQL Editor to safely grant admin rights.
-- Never expose admin promotion to public registration forms.
-- ==============================================================================

-- Step 1: Replace 'admin@salalakartzone.com' below with the email of the trusted account
-- you have registered through the application or Supabase Auth dashboard.
DO $$
DECLARE
  target_email TEXT := 'admin@salalakartzone.com';
  target_user_id UUID;
BEGIN
  -- Look up user ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Target user with email "%" was not found in auth.users. Please create this account first in your Supabase Auth dashboard or register it in the website.', target_email;
  ELSE
    -- 1. Ensure profile exists in public.profiles
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (target_user_id, target_email, 'Store Administrator')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- 2. Clear previous role assignment to ensure no role conflict
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id;

    -- 3. Assign authorized admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'SUCCESS: Granted administrator privileges to % (User ID: %)', target_email, target_user_id;
  END IF;
END $$;
