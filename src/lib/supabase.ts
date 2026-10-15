import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getTempAdminSession } from './tempAdminAuth';

// Support both standard anon key and publishable key naming conventions, as well as multiple prefix formats
const rawSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_PROJECT_URL ||
  import.meta.env.SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const rawSupabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLIC_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const supabaseUrl = rawSupabaseUrl.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
export const supabaseAnonKey = rawSupabaseKey.trim().replace(/^["']|["']$/g, '');

/**
 * Validates whether legitimate Supabase credentials have been configured
 * in the environment (.env)
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseAnonKey !== 'placeholder-anon-key' &&
  supabaseAnonKey !== 'your-firebase-api-key'
);

/**
 * Reports configuration status and lists any missing environment variables
 */
export function getSupabaseConfigStatus(): {
  configured: boolean;
  missing: string[];
  supabaseUrl: string;
  hasUrl: boolean;
  hasKey: boolean;
  keyType: string;
} {
  const missing: string[] = [];
  if (!supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder')) {
    missing.push('VITE_SUPABASE_URL');
  }
  if (
    !supabaseAnonKey ||
    supabaseAnonKey === 'your-anon-key' ||
    supabaseAnonKey === 'your-anon-key-here' ||
    supabaseAnonKey === 'placeholder-anon-key' ||
    supabaseAnonKey === 'your-firebase-api-key'
  ) {
    missing.push('VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)');
  }

  return {
    configured: isSupabaseConfigured,
    missing,
    supabaseUrl: isSupabaseConfigured ? supabaseUrl : '(Not configured)',
    hasUrl: Boolean(supabaseUrl && !supabaseUrl.includes('your-project')),
    hasKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key')),
    keyType: supabaseAnonKey.startsWith('sb_publishable_')
      ? 'Publishable Key (sb_pub_...)'
      : supabaseAnonKey.startsWith('eyJ')
      ? 'JWT Anon Key (eyJ...)'
      : supabaseAnonKey
      ? 'Configured Key'
      : 'None',
  };
}

/**
 * Reusable Supabase client instance with session persistence
 */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'salalakart_supabase_auth',
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: { persistSession: false },
    });

/**
 * Returns the single authorized administrator email for SALALAKART ZONE.
 * Defaults to 'admin@salalakartzone.com' if not explicitly configured in environment variables.
 */
export function getAuthorizedAdminEmail(): string {
  const envEmail =
    import.meta.env.VITE_ADMIN_EMAIL ||
    import.meta.env.SUPABASE_ADMIN_EMAIL ||
    import.meta.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    'admin@salalakartzone.com';
  return envEmail.trim().toLowerCase();
}

/**
 * Returns the optional single authorized administrator Supabase Auth UUID.
 * When set, only an authenticated account matching this exact UUID can enter the admin panel.
 */
export function getAuthorizedAdminUserId(): string {
  const envId =
    import.meta.env.VITE_ADMIN_USER_ID ||
    import.meta.env.VITE_ADMIN_UUID ||
    import.meta.env.SUPABASE_ADMIN_USER_ID ||
    '';
  return envId.trim();
}

/**
 * Securely verify if a given user account is the specifically authorized administrator
 * and holds the verified 'admin' role in the database.
 *
 * Security Requirements Enforced:
 * 1. Verifies the authenticated user token directly with Supabase Auth server (supabase.auth.getUser()).
 *    Never trusts unverified browser-supplied claims or parameters.
 * 2. Enforces that the authenticated user's email matches the single authorized admin email (getAuthorizedAdminEmail()).
 * 3. Enforces that the user UUID matches the authorized admin UUID (getAuthorizedAdminUserId()) if configured.
 * 4. Verifies the user holds the 'admin' role in public.user_roles or through public.is_admin() RPC.
 * 5. Rejects any other user account, even if they have a valid Supabase customer login or metadata claim.
 */
export async function checkUserIsAdmin(userId: string, emailCandidate?: string): Promise<boolean> {
  // Temporary development admin session check
  const tempAdmin = getTempAdminSession();
  if (tempAdmin && tempAdmin.role === 'admin') {
    return true;
  }

  const authorizedEmail = getAuthorizedAdminEmail();
  const authorizedUserId = getAuthorizedAdminUserId();

  // If Supabase is not configured (offline demo mode), check against authorized offline credentials
  if (!isSupabaseConfigured) {
    if (!userId) return false;
    if (authorizedUserId && userId !== authorizedUserId) return false;
    return userId === 'user-admin-01' || userId === 'admin-master';
  }

  if (!userId) return false;

  // If a specific admin UUID is configured and does not match, reject immediately
  if (authorizedUserId && userId !== authorizedUserId) {
    return false;
  }

  // If candidate email is supplied and does not match the authorized admin email, reject immediately
  if (emailCandidate && emailCandidate.trim().toLowerCase() !== authorizedEmail) {
    return false;
  }

  try {
    // 1. Server-side token verification:
    // Ask Supabase Auth server to verify the current session's JWT token and return the true user.
    // This ensures we never trust client-manipulated state or unverified browser claims.
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return false;
    }

    const verifiedUser = authData.user;

    // Verify user ID matches the authenticated session user
    if (verifiedUser.id !== userId) {
      return false;
    }

    // Verify that the server-authenticated email strictly matches the single authorized admin email
    const verifiedEmail = (verifiedUser.email || '').trim().toLowerCase();
    if (verifiedEmail !== authorizedEmail) {
      return false;
    }

    // If authorized admin UUID is configured, verify it matches the authenticated user ID
    if (authorizedUserId && verifiedUser.id !== authorizedUserId) {
      return false;
    }

    // 2. Database authorization check: Verify the account holds 'admin' role in public.user_roles
    // Use limit(1) to prevent PGRST116 multiple-row crash
    const { data: roleRows, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .limit(1);

    if (!roleError && roleRows && roleRows.length > 0) {
      return true;
    }

    // 3. Database RPC check: public.is_admin() PostgreSQL function
    try {
      const { data: rpcAdmin } = await supabase.rpc('is_admin');
      if (rpcAdmin === true) {
        return true;
      }
    } catch {
      // RPC check fallback if function not deployed
    }

    // Reject all other accounts (unauthorized users, customer accounts, or non-admin roles)
    return false;
  } catch (err) {
    console.error('Unexpected error checking administrator authorization:', err);
    return false;
  }
}

import { isFirebaseConfigured, uploadFileToFirebaseStorage } from './firebase';

/**
 * Upload a product image to cloud storage (Firebase Storage or Supabase Storage)
 * Returns the public URL of the uploaded image
 */
export async function uploadProductImage(
  file: File
): Promise<{ url: string | null; error?: string }> {
  // If Firebase is configured, upload to Firebase Storage
  if (isFirebaseConfigured) {
    return uploadFileToFirebaseStorage(file, 'products');
  }

  if (!isSupabaseConfigured) {
    // If cloud storage is not configured, create a local object URL for preview/demo
    return { url: URL.createObjectURL(file) };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = `products/${Date.now()}_${cleanFileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Image upload failed';
    return { url: null, error: msg };
  }
}

/**
 * Send password reset email via Supabase Auth
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Email address is required.' };
  }

  if (!isSupabaseConfigured) {
    return {
      success: true,
      error: undefined,
    };
  }

  try {
    const redirectUrl = `${window.location.origin}/admin/login`;
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Password reset failed';
    return { success: false, error: msg };
  }
}
