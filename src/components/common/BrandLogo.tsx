import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  useImage?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  useImage = false,
  className = '',
}) => {
  // If useImage is true, show the physical storefront photo or cropped logo
  if (useImage) {
    const imgHeight = {
      sm: 'h-9',
      md: 'h-12',
      lg: 'h-16',
      xl: 'h-24',
    }[size];

    return (
      <Link to="/" className={`inline-flex items-center gap-2 group ${className}`}>
        <img
          src="/logo.jpg"
          alt="SALALAKART ZONE"
          className={`${imgHeight} object-contain rounded-lg shadow-sm border border-pink-100 group-hover:scale-105 transition-transform`}
        />
        <div className="flex flex-col">
          <span className="font-brand font-bold text-lg leading-tight tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            SALALAKART ZONE
          </span>
          {showTagline && (
            <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
              GIFTS • WATCH • GADGETS • TOYS
            </span>
          )}
        </div>
      </Link>
    );
  }

  // Crisp Vector SVG Brand Representation with exact colorful lettering
  const scaleClass = {
    sm: 'scale-90',
    md: 'scale-100',
    lg: 'scale-110',
    xl: 'scale-125',
  }[size];

  return (
    <Link
      to="/"
      className={`inline-flex flex-col items-center group select-none text-center ${scaleClass} ${className}`}
      title="SALALAKART ZONE — Home"
    >
      {/* Playful Top Rainbow Icon Banner */}
      <div className="flex items-center justify-center gap-1.5 -mb-1">
        {/* Star */}
        <span className="text-red-500 text-xs sm:text-sm animate-bounce" style={{ animationDuration: '3s' }}>
          ★
        </span>
        {/* Cloud */}
        <span className="text-sky-500 text-xs font-bold">☁️</span>
        {/* Mini Rainbow Arc */}
        <div className="w-10 h-3 rounded-t-full border-t-[3px] border-l-[3px] border-r-[3px] border-amber-400 bg-gradient-to-t from-transparent to-pink-100 flex items-center justify-center">
          <span className="text-[10px]">🚂</span>
        </div>
        {/* Teddy Bear */}
        <span className="text-emerald-600 text-xs font-bold">🧸</span>
        {/* Watch */}
        <span className="text-rose-500 text-xs font-bold">⌚</span>
      </div>

      {/* Colorful 3D "salalakart" */}
      <div className="font-brand font-extrabold tracking-normal flex items-baseline leading-none text-xl sm:text-3xl drop-shadow-sm group-hover:scale-[1.02] transition-transform">
        <span className="text-pink-600 drop-shadow-[0_2px_1px_rgba(219,39,119,0.2)]">s</span>
        <span className="text-amber-500 drop-shadow-[0_2px_1px_rgba(245,158,11,0.2)]">a</span>
        <span className="text-purple-600 drop-shadow-[0_2px_1px_rgba(147,51,234,0.2)]">l</span>
        <span className="text-sky-500 drop-shadow-[0_2px_1px_rgba(14,165,233,0.2)]">a</span>
        <span className="text-orange-500 drop-shadow-[0_2px_1px_rgba(249,115,22,0.2)]">l</span>
        <span className="text-yellow-500 drop-shadow-[0_2px_1px_rgba(234,179,8,0.2)]">a</span>
        <span className="text-blue-600 drop-shadow-[0_2px_1px_rgba(37,99,235,0.2)]">k</span>
        <span className="text-orange-500 drop-shadow-[0_2px_1px_rgba(249,115,22,0.2)]">a</span>
        <span className="text-amber-600 drop-shadow-[0_2px_1px_rgba(217,119,6,0.2)]">r</span>
        <span className="text-emerald-500 drop-shadow-[0_2px_1px_rgba(16,185,129,0.2)]">t</span>
      </div>

      {/* "Zone" */}
      <div className="font-brand font-extrabold tracking-tight flex items-baseline leading-none text-lg sm:text-2xl -mt-0.5">
        <span className="text-pink-600">Z</span>
        <span className="text-purple-700">o</span>
        <span className="text-sky-500">n</span>
        <span className="text-emerald-500">e</span>
      </div>

      {/* Tagline with dual dots */}
      {showTagline && (
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1 text-[7px] sm:text-[10px] font-extrabold tracking-wider text-slate-700 whitespace-nowrap">
          <span className="hidden sm:flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
          </span>
          <span className="text-slate-800 tracking-wider sm:tracking-widest font-black uppercase">
            GIFT, WATCH, GADGETS, TOYS
          </span>
          <span className="hidden sm:flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          </span>
        </div>
      )}
    </Link>
  );
};
