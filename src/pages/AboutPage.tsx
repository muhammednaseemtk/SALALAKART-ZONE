import React from 'react';
import { useTheme } from '../context/ThemeContext';
import darkLogo from '../assets/Artboard 7 copy.png';
import lightLogo from '../assets/Artboard 8.png';
import { ShieldCheck, Heart, Truck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { theme } = useTheme();
  const aboutImage = theme === 'dark' ? darkLogo : lightLogo;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 dark:bg-[#8fe40f]/15 dark:text-[#8fe40f] px-3 py-1 rounded-full">
          Our Brand Story
        </span>
        <h1 className="font-brand font-black text-4xl sm:text-5xl text-slate-900 dark:text-white leading-tight">
          Bringing Colorful Joy to Salalah & Beyond!
        </h1>
        <p className="text-base text-slate-600 dark:text-[#f2f3ed]/90 leading-relaxed">
          From our bustling shop in the heart of Salalah to doorsteps across the Sultanate,
          <strong> SALALAKART ZONE</strong> is passionate about curating authentic toys, smart lifestyle gadgets,
          trendy watches, and heartfelt gifts.
        </p>
      </div>

      {/* Hero Brand Identity Showcase */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl mb-16 max-w-3xl mx-auto border-2 border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#033d2f] p-8 sm:p-12 flex flex-col items-center justify-center transition-colors duration-200">
        <img
          src={aboutImage}
          alt="SALALAKART ZONE"
          className="w-full max-h-72 sm:max-h-84 object-contain object-center transition-all duration-300"
        />
        <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-white/10 w-full">
          <h3 className="font-brand font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
            The Official Brand Identity
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#f2f3ed]/80 mt-1">
            Shop 12, Commercial Market Square, Salalah • Gifts, Watch, Gadgets, Toys
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
        <div className="bg-white dark:bg-[#033d2f] p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm text-center space-y-3 transition-colors duration-200">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-black/30 text-pink-500 dark:text-[#8fe40f] flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-brand font-bold text-lg text-slate-900 dark:text-white">Childhood Curiosity</h3>
          <p className="text-xs text-slate-600 dark:text-[#f2f3ed]/80 leading-relaxed">
            We believe imaginative play, building kits and STEM puzzles inspire tomorrow’s innovators and thinkers.
          </p>
        </div>

        <div className="bg-white dark:bg-[#033d2f] p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm text-center space-y-3 transition-colors duration-200">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-black/30 text-purple-600 dark:text-[#8fe40f] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="font-brand font-bold text-lg text-slate-900 dark:text-white">Safe & Tested Toys</h3>
          <p className="text-xs text-slate-600 dark:text-[#f2f3ed]/80 leading-relaxed">
            Every item in our collection complies with strict non-toxic, child-safe durability standards.
          </p>
        </div>

        <div className="bg-white dark:bg-[#033d2f] p-8 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm text-center space-y-3 transition-colors duration-200">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-black/30 text-cyan-600 dark:text-[#8fe40f] flex items-center justify-center mx-auto">
            <Truck className="w-7 h-7" />
          </div>
          <h3 className="font-brand font-bold text-lg text-slate-900 dark:text-white">Rapid Delivery</h3>
          <p className="text-xs text-slate-600 dark:text-[#f2f3ed]/80 leading-relaxed">
            Need a last-minute birthday gift or reward? We pack and dispatch with speed so celebrations never wait.
          </p>
        </div>
      </div>
    </div>
  );
};
