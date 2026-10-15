/**
 * ==============================================================================
 * SALALAKART ZONE — TEMPORARY DEVELOPMENT-ONLY ADMIN AUTHENTICATION
 * ==============================================================================
 * IMPORTANT SECURITY LIMITATION:
 * This is a temporary development-only hardcoded login for testing and validation.
 * Do not treat frontend hardcoded credentials as production security.
 * Client-side credentials can be discovered by inspecting the website's JavaScript.
 *
 * This implementation is strictly isolated so that it can easily be replaced
 * with server-side Supabase Auth and database RLS authorization in production.
 * ==============================================================================
 */

// 1. Fixed Admin Credentials (Temporary Development Testing)
export const TEMP_ADMIN_CREDENTIALS = {
  email: 'admin@salalakartzone.com',
  password: 'admin@123',
} as const;

export const TEMP_ADMIN_SESSION_KEY = 'salalakart_temp_admin_session';

export interface TempAdminSession {
  id: string;
  email: string;
  full_name: string;
  role: 'admin';
  authenticatedAt: string;
}

/**
 * Validates the entered admin email and password against the configured credentials.
 * Allow login only when both values match exactly.
 */
export function validateTempAdminCredentials(email: string, password: string): boolean {
  const cleanEmail = (email || '').trim().toLowerCase();
  const targetEmail = TEMP_ADMIN_CREDENTIALS.email.toLowerCase();
  return cleanEmail === targetEmail && password === TEMP_ADMIN_CREDENTIALS.password;
}

/**
 * Retrieves the active temporary admin session from browser storage, if valid.
 */
export function getTempAdminSession(): TempAdminSession | null {
  try {
    const raw =
      sessionStorage.getItem(TEMP_ADMIN_SESSION_KEY) ||
      localStorage.getItem(TEMP_ADMIN_SESSION_KEY);
    if (!raw) return null;

    const parsed: TempAdminSession = JSON.parse(raw);
    if (
      parsed &&
      parsed.role === 'admin' &&
      (parsed.email || '').trim().toLowerCase() === TEMP_ADMIN_CREDENTIALS.email.toLowerCase()
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves the temporary admin session to both session and local storage to prevent
 * accidental bypass or loss on page refresh.
 */
export function setTempAdminSession(): TempAdminSession {
  const session: TempAdminSession = {
    id: 'admin-master',
    email: TEMP_ADMIN_CREDENTIALS.email,
    full_name: 'Store Administrator',
    role: 'admin',
    authenticatedAt: new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(TEMP_ADMIN_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(TEMP_ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Unable to persist temp admin session:', err);
  }

  return session;
}

/**
 * Clears the temporary admin session from all browser storage on logout.
 */
export function clearTempAdminSession(): void {
  try {
    sessionStorage.removeItem(TEMP_ADMIN_SESSION_KEY);
    localStorage.removeItem(TEMP_ADMIN_SESSION_KEY);
  } catch (err) {
    console.warn('Unable to clear temp admin session:', err);
  }
}
