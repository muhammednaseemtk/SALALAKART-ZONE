import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both standard anon key and publishable key naming conventions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

/**
 * Validates whether legitimate Supabase credentials have been configured
 * in the environment (.env)
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseAnonKey !== 'placeholder-anon-key'
);

/**
 * Reports configuration status and lists any missing environment variables
 */
export function getSupabaseConfigStatus(): {
  configured: boolean;
  missing: string[];
  supabaseUrl: string;
} {
  const missing: string[] = [];
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    missing.push('VITE_SUPABASE_URL');
  }
  if (
    !supabaseAnonKey ||
    supabaseAnonKey === 'your-anon-key' ||
    supabaseAnonKey === 'placeholder-anon-key'
  ) {
    missing.push('VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)');
  }

  return {
    configured: isSupabaseConfigured,
    missing,
    supabaseUrl: isSupabaseConfigured ? supabaseUrl : '(Not configured)',
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
 */
export async function checkUserIsAdmin(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return false;
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.warn('Error verifying admin authorization in user_roles:', error.message);
      return false;
    }

    return data?.role === 'admin';
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
