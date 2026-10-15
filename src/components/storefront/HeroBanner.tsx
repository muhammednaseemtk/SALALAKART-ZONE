import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../../types';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  banners: Banner[];
}

// Clean, modern brand gradients using official brand palette:
// Primary dark green: #033d2f
// Accent bright green: #8fe40f
// White: #ffffff
// Light background: #f2f3ed
// Black: #000000
const BRAND_GRADIENTS = [
  {
    light: 'from-[#f2f3ed] via-[#ffffff] to-[#e4eed7]',
    dark: 'from-[#033d2f] via-[#02281f] to-[#054d3b]',
  },
  {
    light: 'from-[#ffffff] via-[#f2f3ed] to-[#ddead0]',
    dark: 'from-[#02281f] via-[#033d2f] to-[#044635]',
  },
  {
    light: 'from-[#f2f3ed] via-[#edf5e7] to-[#ffffff]',
    dark: 'from-[#033d2f] via-[#044e3d] to-[#02231b]',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];
  const activeGradient = BRAND_GRADIENTS[currentIndex % BRAND_GRADIENTS.length];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#f2f3ed] dark:bg-[#033d2f] border border-[#dce0d4] dark:border-[#8fe40f]/20 shadow-xl my-6 transition-colors duration-300">
      {/* Background and Image */}
      <div className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] flex items-center">
        {/* Ambient Gradient Background - Light Mode */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${activeGradient.light} opacity-95 transition-opacity duration-700 dark:opacity-0 pointer-events-none`}
        />

        {/* Ambient Gradient Background - Dark Mode */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${activeGradient.dark} opacity-0 transition-opacity duration-700 dark:opacity-95 pointer-events-none`}
        />

        {/* Backdrop Image Overlay */}
        <img
          src={current.image_url}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-25 dark:mix-blend-overlay dark:opacity-40 scale-105 transition-transform duration-1000"
        />

        {/* Directional Overlay to Guarantee High Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f2f3ed]/90 via-[#f2f3ed]/50 to-transparent dark:from-[#033d2f]/90 dark:via-[#033d2f]/50 dark:to-transparent pointer-events-none transition-all duration-700" />

        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#8fe40f]/20 dark:bg-[#8fe40f]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#033d2f]/10 dark:bg-[#033d2f]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Content Box */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-12 py-8 sm:py-12 w-full z-10">
          <div className="max-w-2xl text-[#033d2f] dark:text-white space-y-4 sm:space-y-5 animate-in fade-in duration-500">
            {/* Badge */}
            {current.badge_text && (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#033d2f]/10 dark:bg-[#8fe40f]/15 backdrop-blur-md border border-[#033d2f]/20 dark:border-[#8fe40f]/30 text-[#033d2f] dark:text-[#8fe40f] font-extrabold text-[11px] sm:text-xs tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#033d2f] dark:text-[#8fe40f] animate-spin" style={{ animationDuration: '6s' }} />
                <span>{current.badge_text}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="font-brand font-black text-2xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15] sm:leading-[1.1] text-[#033d2f] dark:text-white drop-shadow-xs dark:drop-shadow-md">
              {current.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-lg text-[#3d524a] dark:text-[#f2f3ed]/90 font-medium leading-relaxed max-w-xl drop-shadow-xs">
              {current.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
              <Link
                to={current.link_url || '/shop'}
                className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-[#033d2f] text-white hover:bg-[#02281f] shadow-lg shadow-[#033d2f]/20 dark:bg-[#8fe40f] dark:text-[#033d2f] dark:hover:bg-[#a2f22b] dark:shadow-xl dark:shadow-black/20 font-extrabold text-xs sm:text-base hover:scale-105 transition-all flex items-center gap-2 group"
              >
                <span>{current.button_text || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop"
                className="px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#033d2f]/10 hover:bg-[#033d2f]/15 border border-[#033d2f]/20 text-[#033d2f] dark:bg-white/15 dark:hover:bg-white/25 dark:border-white/30 dark:text-white backdrop-blur-md font-bold text-xs sm:text-base transition-all"
              >
                View All Categories
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#033d2f] border border-[#dce0d4] shadow-md dark:bg-black/40 dark:hover:bg-black/70 dark:text-white dark:border-white/10 backdrop-blur-md items-center justify-center transition-all z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#033d2f] border border-[#dce0d4] shadow-md dark:bg-black/40 dark:hover:bg-black/70 dark:text-white dark:border-white/10 backdrop-blur-md items-center justify-center transition-all z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-8 bg-[#033d2f] dark:bg-[#8fe40f]'
                    : 'w-2.5 bg-[#033d2f]/30 hover:bg-[#033d2f]/60 dark:bg-white/40 dark:hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
