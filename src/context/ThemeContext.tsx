import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type Theme = 'light' | 'dark';
export type ThemeScope = 'user' | 'admin';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  scope: ThemeScope;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage keys for strict theme separation
export const USER_THEME_STORAGE_KEY = 'salalakart_user_theme';
export const ADMIN_THEME_STORAGE_KEY = 'salalakart_admin_theme';
export const LEGACY_THEME_STORAGE_KEY = 'salalakart_theme';
export const THEME_STORAGE_KEY = USER_THEME_STORAGE_KEY; // Backward compatibility alias

/**
 * Retrieves the stored theme preference for the given scope with light default.
 */
export const getStoredTheme = (scope: ThemeScope): Theme => {
  if (typeof window === 'undefined') return 'light';
  try {
    const key = scope === 'admin' ? ADMIN_THEME_STORAGE_KEY : USER_THEME_STORAGE_KEY;
    const stored = localStorage.getItem(key);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    // Backward compatibility fallback for user theme if legacy key exists
    if (scope === 'user') {
      const legacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
      if (legacy === 'dark' || legacy === 'light') {
        return legacy;
      }
    }
  } catch {
    // Ignore storage access restrictions
  }
  return 'light'; // First-time default is light
};

/**
 * Synchronizes the HTML root element classes, attributes, and color scheme.
 */
export const applyThemeToDOM = (activeTheme: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (activeTheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
};

export interface ThemeProviderProps {
  children: React.ReactNode;
  scope?: ThemeScope;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  scope: explicitScope,
}) => {
  // Determine scope: explicit prop or auto-detect based on current URL path
  const detectedScope: ThemeScope =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
      ? 'admin'
      : 'user';
  const scope = explicitScope || detectedScope;
  const storageKey = scope === 'admin' ? ADMIN_THEME_STORAGE_KEY : USER_THEME_STORAGE_KEY;

  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme(scope));

  // Sync DOM and save strictly to the designated storage key
  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Ignore storage write error
    }
  }, [theme, storageKey]);

  // Ensure DOM is synchronized whenever this provider mounts or becomes active
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Cross-tab synchronization for the SAME scope only (never cross-updates admin vs user)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
        applyThemeToDOM(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      isDark: theme === 'dark',
      scope,
    }),
    [theme, toggleTheme, setTheme, scope]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Dedicated Customer/Storefront Theme Provider
 */
export const UserThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider scope="user">{children}</ThemeProvider>
);

/**
 * Dedicated Admin Panel Theme Provider
 */
export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider scope="admin">{children}</ThemeProvider>
);

/**
 * Hook to consume the current area's active theme context (user or admin).
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Standalone hook strictly for User Theme
 */
export const useUserTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context && context.scope === 'user') {
    return context;
  }
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme('user'));
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    localStorage.setItem(USER_THEME_STORAGE_KEY, next);
  };
  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(USER_THEME_STORAGE_KEY, t);
  };
  return { theme, toggleTheme, setTheme, isDark: theme === 'dark', scope: 'user' };
};

/**
 * Standalone hook strictly for Admin Theme
 */
export const useAdminTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context && context.scope === 'admin') {
    return context;
  }
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme('admin'));
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, next);
  };
  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, t);
  };
  return { theme, toggleTheme, setTheme, isDark: theme === 'dark', scope: 'admin' };
};
