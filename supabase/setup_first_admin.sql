-- ==============================================================================
-- SALALAKART ZONE — SECURE FIRST ADMINISTRATOR SETUP SCRIPT
-- Run this in the Supabase Dashboard SQL Editor to safely grant admin rights.
-- Never expose admin promotion to public registration forms.
-- ==============================================================================

-- Step 1: Replace 'admin@salalakartzone.com' with the email of the trusted account
-- you have registered through the application or Supabase Auth.
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
    RAISE NOTICE 'Target user with email % was not found. Please register this account first in the app or Supabase Auth dashboard.', target_email;
  ELSE
    -- Insert or update admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Successfully granted admin privileges to user % (ID: %)', target_email, target_user_id;
  END IF;
END $$;
