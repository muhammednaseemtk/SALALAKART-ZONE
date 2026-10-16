import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import adminLightLogo from '../../assets/Artboard 9.png';
import adminDarkLogo from '../../assets/Artboard 11.png';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Boxes,
  Image,
  Star,
  CreditCard,
  BarChart3,
  Settings,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? adminDarkLogo : adminLightLogo;

  const navItems = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Categories', to: '/admin/categories', icon: Layers },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
    { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Banners', to: '/admin/banners', icon: Image },
    { label: 'Reviews', to: '/admin/reviews', icon: Star },
    { label: 'Payments', to: '/admin/payments', icon: CreditCard },
    { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
    { label: 'Store Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#033d2f] dark:bg-black text-white z-50 flex flex-col border-r border-[#022920] dark:border-white/10 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#022920] dark:border-white/10 flex flex-col items-center justify-center text-center gap-2">
          <div className="bg-white/95 dark:bg-black/50 p-2.5 rounded-2xl inline-flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-white/10">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center justify-center hover:opacity-95 transition-opacity"
              title="SALALAKART ZONE Admin"
            >
              <img
                src={logoSrc}
                alt="SALALAKART ZONE"
                className="h-11 sm:h-12 w-auto max-w-full object-contain"
                loading="eager"
              />
            </Link>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-[#8fe40f]/20 text-[#8fe40f] border border-[#8fe40f]/30 tracking-wider">
            Admin
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
          <p className="text-[10px] font-bold text-[#8fe40f] uppercase tracking-wider px-3 py-2">
            Store Management
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#8fe40f] text-[#033d2f] font-bold shadow-md shadow-black/20'
                      : 'text-white hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Storefront</span>
            </span>
            <span className="text-[10px] text-slate-500">Visit ↗</span>
          </Link>
          <div className="px-3 py-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>RLS Security Enforced</span>
          </div>
        </div>
      </aside>
    </>
  );
};
