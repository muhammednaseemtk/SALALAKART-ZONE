import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../services/supabase';
import { Menu, LogOut, Database, UserCheck, Bell } from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, backendType } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="font-brand font-bold text-base text-slate-900 block leading-tight">
            SALALAKART ZONE Admin
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Control Center & Inventory Hub</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend status badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-slate-200 bg-slate-50 text-slate-600">
          <Database className="w-3.5 h-3.5 text-pink-500" />
          <span>
            {backendType === 'firebase'
              ? 'Connected: Google Firebase'
              : backendType === 'supabase'
              ? 'Connected: Supabase Cloud'
              : 'Storage: Persistent Local Store'}
          </span>
        </div>

        {/* Admin profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-xs">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{user?.full_name}</p>
            <p className="text-[10px] text-purple-600 font-semibold">Store Manager</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
