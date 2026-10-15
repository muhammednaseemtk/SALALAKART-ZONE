import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
 * Securely verify if a given user account holds the 'admin' role in the database.
 * Never trusts client metadata or client claims alone.
 * Checks:
 * 1. public.user_roles table (using limit(1) to prevent PGRST116 multiple-row crash)
 * 2. public.is_admin() PostgreSQL RPC function
 * 3. public.profiles.role column if custom schema stores role directly
 * 4. Supabase Auth app_metadata / user_metadata claims
 */
export async function checkUserIsAdmin(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;
  try {
    // 1. Primary check: public.user_roles table (use limit(1) to avoid PGRST116 multi-row crash)
    const { data: roleRows, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .limit(1);

    if (!roleError && roleRows && roleRows.length > 0) {
      return true;
    }

    // 2. Secondary check: public.is_admin() PostgreSQL RPC function
    try {
      const { data: rpcAdmin } = await supabase.rpc('is_admin');
      if (rpcAdmin === true) {
        return true;
      }
    } catch {
      // RPC might not exist or user doesn't have execute permission
    }

    // 3. Fallback check: public.profiles table (if custom schema includes a role column)
    try {
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .limit(1)
        .maybeSingle();

      if (profileRow && (profileRow as any).role === 'admin') {
        return true;
      }
    } catch {
      // 'role' column may not exist on profiles table
    }

    // 4. Fallback check: Supabase Auth metadata (app_metadata or user_metadata assigned by admin)
    try {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;
      if (authUser && authUser.id === userId) {
        const appRole = authUser.app_metadata?.role;
        const userRole = authUser.user_metadata?.role;
        const isAdminFlag = authUser.app_metadata?.is_admin || authUser.user_metadata?.is_admin;
        if (appRole === 'admin' || userRole === 'admin' || isAdminFlag === true) {
          return true;
        }
      }
    } catch {
      // metadata check failed
    }

    return false;
  } catch (err) {
    console.error('Unexpected error checking admin role:', err);
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
