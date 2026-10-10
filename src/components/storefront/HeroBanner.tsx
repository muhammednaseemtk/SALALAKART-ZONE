import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../../types';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  banners: Banner[];
}

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

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-900 shadow-xl my-6">
      {/* Background and Image */}
      <div className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] flex items-center">
        {/* Ambient Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            current.bg_gradient || 'from-pink-600 via-purple-600 to-indigo-700'
          } opacity-90 transition-all duration-700`}
        />

        {/* Backdrop Image Overlay */}
        <img
          src={current.image_url}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 scale-105 transition-transform duration-1000"
        />

        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content Box */}
        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-12 w-full z-10">
          <div className="max-w-2xl text-white space-y-5 animate-in fade-in duration-500">
            {/* Badge */}
            {current.badge_text && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{current.badge_text}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="font-brand font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white drop-shadow-md">
              {current.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-pink-50 font-medium leading-relaxed max-w-xl drop-shadow-xs">
              {current.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={current.link_url || '/shop'}
                className="px-7 py-3.5 rounded-2xl bg-white text-slate-900 font-extrabold text-sm sm:text-base hover:bg-yellow-300 hover:text-slate-900 shadow-xl shadow-black/20 hover:scale-105 transition-all flex items-center gap-2 group"
              >
                <span>{current.button_text || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop"
                className="px-6 py-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-white font-bold text-sm sm:text-base hover:bg-white/25 transition-all"
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
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all z-20"
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
                  idx === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
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
