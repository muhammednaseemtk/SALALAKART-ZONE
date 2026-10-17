import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  validateTempAdminCredentials,
  getTempAdminSession,
  setTempAdminSession,
  clearTempAdminSession,
  TEMP_ADMIN_CREDENTIALS,
} from '../lib/tempAdminAuth';
import {
  supabase,
  isSupabaseConfigured,
  checkUserIsAdmin,
  getAuthorizedAdminEmail,
  getAuthorizedAdminUserId,
  sendPasswordResetEmail as sendSupabasePasswordReset,
} from '../lib/supabase';
import {
  auth as firebaseAuth,
  db as firestoreDb,
  isFirebaseConfigured,
  checkFirebaseUserIsAdmin,
  sendFirebasePasswordReset,
} from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';

export type BackendType = 'firebase' | 'supabase' | 'local';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  backendType: BackendType;
  isSupabaseConnected: boolean;
  isFirebaseConnected: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  // Evaluation / Demo buttons
  loginAsDemoAdmin: () => void;
  loginAsDemoCustomer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'salalakart_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const backendType: BackendType = isFirebaseConfigured
    ? 'firebase'
    : isSupabaseConfigured
    ? 'supabase'
    : 'local';

  // Initialize session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setIsLoading(true);

      // 1. Check for temporary development admin session
      const tempAdmin = getTempAdminSession();
      if (tempAdmin && mounted) {
        // Ensure Supabase Auth session is active so PostgreSQL RLS policies permit admin operations
        if (isSupabaseConfigured) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              await supabase.auth.signInWithPassword({
                email: tempAdmin.email,
                password: TEMP_ADMIN_CREDENTIALS.password,
              });
            }
          } catch (authErr) {
            console.warn('Failed to auto-refresh Supabase admin session:', authErr);
          }
        }

        const adminProfile: UserProfile = {
          id: tempAdmin.id,
          email: tempAdmin.email,
          full_name: tempAdmin.full_name,
          phone: '+968 9123 4567',
          role: 'admin',
          created_at: tempAdmin.authenticatedAt,
        };
        setUser(adminProfile);
        setIsLoading(false);
        return;
      }

      if (isFirebaseConfigured) {
        // Firebase Auth session listener handles initial and reactive state
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
          if (!mounted) return;
          if (fbUser) {
            await fetchFirebaseUserProfile(fbUser.uid, fbUser.email || '');
          } else {
            setUser(null);
            handleLocalSessionClear();
          }
          setIsLoading(false);
        });

        return () => {
          mounted = false;
          unsubscribe();
        };
      } else if (isSupabaseConfigured) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            await fetchSupabaseUserProfile(session.user.id, session.user.email || '');
          } else if (mounted) {
            setUser(null);
          }
        } catch (err) {
          console.warn('Supabase auth session initialization error:', err);
        }

        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
            await fetchSupabaseUserProfile(session.user.id, session.user.email || '');
          } else if (event === 'SIGNED_OUT') {
            handleLocalSessionClear();
            setUser(null);
          }
        });

        if (mounted) setIsLoading(false);
        return () => {
          mounted = false;
          data.subscription.unsubscribe();
        };
      } else {
        // Local storage demo mode
        const stored = localStorage.getItem(LOCAL_AUTH_KEY);
        if (stored && mounted) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            localStorage.removeItem(LOCAL_AUTH_KEY);
          }
        }
        if (mounted) setIsLoading(false);
      }
    }

    const cleanupPromise = initAuth();

    return () => {
      mounted = false;
      if (cleanupPromise && typeof cleanupPromise.then === 'function') {
        cleanupPromise.then((cleanup) => {
          if (typeof cleanup === 'function') cleanup();
        });
      }
    };
  }, []);

  const handleLocalSessionClear = () => {
    clearTempAdminSession();
    localStorage.removeItem(LOCAL_AUTH_KEY);
    localStorage.removeItem('salalakart_active_cart');
    localStorage.removeItem('salalakart_active_wishlist');
    localStorage.removeItem('salalakart_admin_session');
    localStorage.removeItem('salalakart_supabase_auth');
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
  };

  /**
   * Fetch Firestore User Profile & Role
   */
  const fetchFirebaseUserProfile = async (
    userId: string,
    email: string
  ): Promise<UserProfile | null> => {
    try {
      const profileSnap = await getDoc(doc(firestoreDb, 'profiles', userId));
      const roleSnap = await getDoc(doc(firestoreDb, 'user_roles', userId));

      const isUserAdmin = (await checkFirebaseUserIsAdmin(userId)) || roleSnap.data()?.role === 'admin';
      const role: UserRole = isUserAdmin ? 'admin' : 'customer';

      const userProfile: UserProfile = {
        id: userId,
        email: email,
        full_name: profileSnap.data()?.full_name || email.split('@')[0],
        phone: profileSnap.data()?.phone || '',
        avatar_url: profileSnap.data()?.avatar_url || '',
        role: role,
        created_at: profileSnap.data()?.created_at || new Date().toISOString(),
      };

      setUser(userProfile);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(userProfile));
      return userProfile;
    } catch (err) {
      console.error('Error fetching Firebase profile:', err);
      return null;
    }
  };

  /**
   * Fetch Supabase User Profile & Role
   */
  const fetchSupabaseUserProfile = async (
    userId: string,
    email: string
  ): Promise<UserProfile | null> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      // Check admin status using the robust multi-layer checkUserIsAdmin helper
      const isUserAdmin = await checkUserIsAdmin(userId, email);
      const role: UserRole = isUserAdmin ? 'admin' : 'customer';

      const userProfile: UserProfile = {
        id: userId,
        email: email,
        full_name: profile?.full_name || email.split('@')[0],
        phone: profile?.phone || '',
        avatar_url: profile?.avatar_url || '',
        role: role,
        created_at: profile?.created_at || new Date().toISOString(),
      };

      setUser(userProfile);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(userProfile));
      return userProfile;
    } catch (err) {
      console.error('Error fetching Supabase profile:', err);
      return null;
    }
  };

  /**
   * General / Customer Login
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Firebase Auth Login
    if (isFirebaseConfigured) {
      try {
        const cred = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);
        await fetchFirebaseUserProfile(cred.user.uid, cred.user.email || cleanEmail);
        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Firebase login failed';
        return { success: false, error: msg };
      }
    }

    // 2. Supabase Auth Login
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          await fetchSupabaseUserProfile(data.user.id, data.user.email || cleanEmail);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Login failed';
        return { success: false, error: msg };
      }
    }

    // 3. Offline / Demo evaluation fallback
    if (cleanEmail === 'admin@salalakartzone.com') {
      if (password !== 'admin123') {
        setIsLoading(false);
        return { success: false, error: 'Invalid password. (Demo: admin123)' };
      }
      const adminProfile: UserProfile = {
        id: 'user-admin-01',
        email: 'admin@salalakartzone.com',
        full_name: 'Store Administrator',
        phone: '+968 9123 4567',
        role: 'admin',
        created_at: new Date().toISOString(),
      };
      setUser(adminProfile);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(adminProfile));
      setIsLoading(false);
      return { success: true };
    }

    const customerProfile: UserProfile = {
      id: `user-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0].toUpperCase(),
      phone: '+968 9123 4455',
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(customerProfile);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(customerProfile));
    setIsLoading(false);
    return { success: true };
  };

  /**
   * ==============================================================================
   * TEMPORARY DEVELOPMENT-ONLY ADMIN AUTHENTICATION
   * ==============================================================================
   * Fixed credentials:
   *   Admin email:    admin@salalakartzone.com
   *   Admin password: admin@123
   *
   * For this testing stage, admin login is intentionally not connected to Supabase Auth.
   * Allow login ONLY when both values match exactly.
   * If either value is incorrect, deny access and display: "Invalid admin email or password."
   * ==============================================================================
   */
  const adminLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // Brief simulation to demonstrate validation & button disabled state
    await new Promise((resolve) => setTimeout(resolve, 250));

    const cleanEmail = (email || '').trim().toLowerCase();
    const isValid = validateTempAdminCredentials(cleanEmail, password);

    if (!isValid) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Invalid admin email or password.',
      };
    }

    // Authenticate with Supabase Auth so PostgreSQL RLS policies recognize the administrator session
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          console.warn('Supabase admin signIn warning:', error.message);
        } else if (data?.user) {
          await fetchSupabaseUserProfile(data.user.id, data.user.email || cleanEmail);
        }
      } catch (err) {
        console.warn('Supabase admin auth exception:', err);
      }
    }

    const session = setTempAdminSession();
    const adminProfile: UserProfile = {
      id: session.id,
      email: session.email,
      full_name: session.full_name,
      phone: '+968 9123 4567',
      role: 'admin',
      created_at: session.authenticatedAt,
    };

    setUser(adminProfile);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(adminProfile));
    setIsLoading(false);
    return { success: true };
  };

  /**
   * Customer Registration
   */
  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Firebase Auth Registration
    if (isFirebaseConfigured) {
      try {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, password);
        const newProfile: UserProfile = {
          id: cred.user.uid,
          email: cleanEmail,
          full_name: fullName,
          phone: phone || '',
          role: 'customer',
          created_at: new Date().toISOString(),
        };

        // Create profile & customer role in Firestore
        await setDoc(doc(firestoreDb, 'profiles', cred.user.uid), newProfile);
        await setDoc(doc(firestoreDb, 'user_roles', cred.user.uid), {
          user_id: cred.user.uid,
          role: 'customer',
          created_at: new Date().toISOString(),
        });

        setUser(newProfile);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newProfile));
        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Firebase registration failed';
        return { success: false, error: msg };
      }
    }

    // 2. Supabase Auth Registration
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || '',
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          await fetchSupabaseUserProfile(data.user.id, data.user.email || cleanEmail);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Registration failed';
        return { success: false, error: msg };
      }
    }

    // 3. Local Registration
    const newProfile: UserProfile = {
      id: `cust-${Date.now()}`,
      email: cleanEmail,
      full_name: fullName,
      phone: phone || '',
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(newProfile);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newProfile));
    setIsLoading(false);
    return { success: true };
  };

  /**
   * Password Reset Flow
   */
  const resetPassword = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isFirebaseConfigured) {
      return sendFirebasePasswordReset(email);
    }
    if (isSupabaseConfigured) {
      return sendSupabasePasswordReset(email);
    }
    return { success: true };
  };

  const logout = async () => {
    setIsLoading(true);
    if (isFirebaseConfigured) {
      try {
        await firebaseSignOut(firebaseAuth);
      } catch (err) {
        console.warn('Firebase signOut error:', err);
      }
    }
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    handleLocalSessionClear();
    setUser(null);
    setIsLoading(false);
  };

  const updateProfile = async (
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Strict security: Never permit users to modify their role, email, or user id
    const { role: ignoredRole, id: ignoredId, email: ignoredEmail, ...safeUpdates } = updates;
    const updated = { ...user, ...safeUpdates, role: user.role, email: user.email, id: user.id };
    setUser(updated);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(updated));

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(firestoreDb, 'profiles', user.id), safeUpdates, { merge: true });
      } catch (err) {
        console.warn('Error updating Firebase profile:', err);
      }
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.full_name,
            phone: updated.phone,
            avatar_url: updated.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Error updating Supabase profile:', err);
      }
    }

    return { success: true };
  };

  const loginAsDemoAdmin = () => {
    const adminUser: UserProfile = {
      id: 'admin-master',
      email: 'admin@salalakartzone.com',
      full_name: 'Salalakart Zone Admin',
      phone: '+968 9123 4567',
      role: 'admin',
      created_at: new Date().toISOString(),
    };
    setUser(adminUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(adminUser));
  };

  const loginAsDemoCustomer = () => {
    const custUser: UserProfile = {
      id: 'cust-demo-1',
      email: 'customer@salalakartzone.com',
      full_name: 'Sara Salim',
      phone: '+968 9888 7766',
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(custUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(custUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        backendType,
        isSupabaseConnected: isSupabaseConfigured,
        isFirebaseConnected: isFirebaseConfigured,
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
        resetPassword,
        loginAsDemoAdmin,
        loginAsDemoCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
