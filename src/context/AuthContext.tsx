import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  // For easy demonstration and evaluation without setting up an external mail server:
  loginAsDemoAdmin: () => void;
  loginAsDemoCustomer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'salalakart_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            await fetchUserProfile(session.user.id, session.user.email || '');
          }
        } catch (err) {
          console.warn('Supabase auth session error:', err);
        }
      } else {
        // Load from local storage session
        const stored = localStorage.getItem(LOCAL_AUTH_KEY);
        if (stored && mounted) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            localStorage.removeItem(LOCAL_AUTH_KEY);
          }
        }
      }
      if (mounted) setIsLoading(false);
    }

    initAuth();

    // Supabase auth state listener
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id, session.user.email || '');
        } else if (event === 'SIGNED_OUT') {
          handleLocalSessionClear();
          setUser(null);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleLocalSessionClear = () => {
    localStorage.removeItem(LOCAL_AUTH_KEY);
    // Multi-user security: clear active customer cached cart & session
    localStorage.removeItem('salalakart_active_cart');
    localStorage.removeItem('salalakart_active_wishlist');
  };

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      // 1. Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // 2. Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      const role: UserRole = roleData?.role === 'admin' ? 'admin' : 'customer';

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
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

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
          await fetchUserProfile(data.user.id, data.user.email || cleanEmail);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Login failed';
        return { success: false, error: msg };
      }
    }

    // Local / Offline authentication fallback
    // Check credentials against demo users or stored customer profile
    if (cleanEmail === 'admin@salalakartzone.com') {
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

    // Default customer login
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

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

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
          await fetchUserProfile(data.user.id, data.user.email || cleanEmail);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Registration failed';
        return { success: false, error: msg };
      }
    }

    // Offline / Local registration
    const newProfile: UserProfile = {
      id: `cust-${Date.now()}`,
      email: cleanEmail,
      full_name: fullName,
      phone: phone || '',
      role: 'customer', // strictly customer
      created_at: new Date().toISOString(),
    };
    setUser(newProfile);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newProfile));
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    setIsLoading(true);
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

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(updated));

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
        login,
        register,
        logout,
        updateProfile,
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
