import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Protect against Back-Forward cache (bfcache) restoration or back-button traversal after logout
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      const navEntry = window.performance?.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if ((e.persisted || navEntry?.type === 'back_forward') && (!isAuthenticated || !isAdmin)) {
        navigate('/admin/login', { replace: true });
      }
    };
    const handlePopState = () => {
      if (!isAuthenticated || !isAdmin) {
        navigate('/admin/login', { replace: true });
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, isAdmin, navigate]);

  // Reactive redirect guard whenever auth state changes to unauthenticated or non-admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/admin/login', { replace: true, state: { from: location } });
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  // Strict role-based protection
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div
      className={`min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'dark' : 'light'
      }`}
      data-theme={theme}
    >
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
