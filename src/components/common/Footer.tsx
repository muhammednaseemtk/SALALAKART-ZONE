import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { Phone, Mail, MapPin, Heart, ShieldCheck, Truck, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#033d2f] dark:bg-black text-slate-300 pt-16 pb-8 border-t border-[#022920] dark:border-white/10 transition-colors duration-200">
      {/* Top Value Propositions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 dark:bg-[#033d2f]/40 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-[#8fe40f]/15 text-[#8fe40f] flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fast Reliable Delivery</h4>
              <p className="text-xs text-[#f2f3ed]/80">Directly to your doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 dark:bg-[#033d2f]/40 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-[#8fe40f]/15 text-[#8fe40f] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine Quality</h4>
              <p className="text-xs text-[#f2f3ed]/80">Safety tested toys & gadgets</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 dark:bg-[#033d2f]/40 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-[#8fe40f]/15 text-[#8fe40f] flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Curated Gifts & Toys</h4>
              <p className="text-xs text-[#f2f3ed]/80">Handpicked for memorable smiles</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 dark:bg-[#033d2f]/40 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-[#8fe40f]/15 text-[#8fe40f] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Friendly Support</h4>
              <p className="text-xs text-[#f2f3ed]/80">Available 7 days a week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="space-y-3 max-w-md">
            <div className="bg-white/95 dark:bg-black/50 p-3 rounded-2xl inline-block shadow-md border border-slate-200/80 dark:border-white/10">
              <BrandLogo size="md" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your premier destination for high-speed RC cars, interactive educational STEM kits,
              smart kids watches, fashionable accessories, and thoughtful gifts in Salalah.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
              <span>Shop 12, Commercial Market Square, Salalah, Dhofar, Oman</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <a href="tel:+96891234567" className="hover:text-white transition-colors">
                +968 9123 4567 (Call & WhatsApp)
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <a href="mailto:support@salalakartzone.com" className="hover:text-white transition-colors">
                support@salalakartzone.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Admin Portal link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} SALALAKART ZONE. All rights reserved.</p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-center">
          <Link to="/about" className="hover:text-slate-300">About</Link>
          <Link to="/privacy-policy" className="hover:text-slate-300">Privacy</Link>
          <Link to="/contact" className="hover:text-slate-300">Contact</Link>
        </div>
      </div>
    </footer>
  );
};
