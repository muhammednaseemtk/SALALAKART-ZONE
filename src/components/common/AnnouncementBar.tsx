import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { StoreSettings } from '../../types';
import { Sparkles, Phone, ShieldCheck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    api.getStoreSettings().then(setSettings);
  }, []);

  if (settings && !settings.is_announcement_enabled) return null;

  return (
    <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
        {/* Left Perks */}
        <div className="hidden md:flex items-center gap-3 text-pink-100 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> 100% Genuine Toys & Gadgets
          </span>
          <span>•</span>
          <span>Fast Delivery across the Country</span>
        </div>

        {/* Center Announcement */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-center tracking-tight sm:tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse shrink-0" />
          <span className="truncate max-w-[290px] sm:max-w-none">
            {settings?.announcement_bar_text ||
              '🎉 Welcome to SALALAKART ZONE! Use code WELCOME10 for 10% OFF • Free shipping on orders over ₹75!'}
          </span>
        </div>

        {/* Right Contact Hotline */}
        <div className="hidden lg:flex items-center gap-3 text-pink-100 text-xs">
          <a
            href={`tel:${settings?.contact_phone || '+96891234567'}`}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-yellow-300" />
            <span>Support: {settings?.contact_phone || '+968 9123 4567'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
