import React from 'react';
import { BrandLogo } from '../components/common/BrandLogo';
import { ShieldCheck, Heart, Sparkles, Smile, Truck, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
          Our Brand Story
        </span>
        <h1 className="font-brand font-black text-4xl sm:text-5xl text-slate-900 leading-tight">
          Bringing Colorful Joy to Salalah & Beyond!
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          From our bustling shop in the heart of Salalah to doorsteps across the Sultanate,
          <strong> SALALAKART ZONE</strong> is passionate about curating authentic toys, smart lifestyle gadgets,
          trendy watches, and heartfelt gifts.
        </p>
      </div>

      {/* Hero Store Image Showcase */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-16 max-w-4xl mx-auto border-4 border-white">
        <img
          src="/logo.jpg"
          alt="SALALAKART ZONE storefront"
          className="w-full h-80 sm:h-96 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent flex items-end p-8 text-white">
          <div>
            <h3 className="font-brand font-bold text-2xl">The Physical Store Identity</h3>
            <p className="text-xs text-slate-200 mt-1">
              Shop 12, Commercial Market Square, Salalah • Gifts, Watch, Gadgets, Toys
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-brand font-bold text-lg text-slate-900">Childhood Curiosity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We believe imaginative play, building kits and STEM puzzles inspire tomorrow’s innovators and thinkers.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="font-brand font-bold text-lg text-slate-900">Safe & Tested Toys</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every item in our collection complies with strict non-toxic, child-safe durability standards.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
            <Truck className="w-7 h-7" />
          </div>
          <h3 className="font-brand font-bold text-lg text-slate-900">Rapid Delivery</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Need a last-minute birthday gift or reward? We pack and dispatch with speed so celebrations never wait.
          </p>
        </div>
      </div>
    </div>
  );
};
