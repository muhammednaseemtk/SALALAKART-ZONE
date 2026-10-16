import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { Phone, Mail, MapPin, Send, CheckCircle, Heart, ShieldCheck, Truck, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

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

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/95 dark:bg-black/50 p-3 rounded-2xl inline-block shadow-md border border-slate-200/80 dark:border-white/10">
              <BrandLogo size="md" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your premier destination for high-speed RC cars, interactive educational STEM kits,
              smart kids watches, fashionable accessories, and thoughtful gifts in Salalah.
            </p>
            <div className="space-y-2 text-xs text-slate-300">
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

          {/* Categories */}
          <div>
            <h4 className="font-brand font-bold text-white text-base mb-4 tracking-wide">Popular Categories</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/category/remote-control-cars" className="hover:text-pink-400 transition-colors">
                  Remote-Control Cars
                </Link>
              </li>
              <li>
                <Link to="/category/watches" className="hover:text-pink-400 transition-colors">
                  Kids & Smart Watches
                </Link>
              </li>
              <li>
                <Link to="/category/educational-toys" className="hover:text-pink-400 transition-colors">
                  Educational STEM Kits
                </Link>
              </li>
              <li>
                <Link to="/category/electronic-gadgets" className="hover:text-pink-400 transition-colors">
                  Electronic Gadgets
                </Link>
              </li>
              <li>
                <Link to="/category/gifts" className="hover:text-pink-400 transition-colors">
                  Heartwarming Gifts
                </Link>
              </li>
              <li>
                <Link to="/category/board-games-and-puzzles" className="hover:text-pink-400 transition-colors">
                  Board Games & Puzzles
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="font-brand font-bold text-white text-base mb-4 tracking-wide">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/about" className="hover:text-[#8fe40f] transition-colors">
                  About Salalakart Zone
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#8fe40f] transition-colors">
                  Contact Us & Store Map
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-[#8fe40f] transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-[#8fe40f] transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#8fe40f] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-[#8fe40f] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-4">
            <h4 className="font-brand font-bold text-white text-base tracking-wide">Stay In The Loop</h4>
            <p className="text-xs text-[#f2f3ed]/80 leading-relaxed">
              Subscribe for VIP discounts, festive toy arrivals and special coupon codes.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Thank you for subscribing! Check your inbox for your 10% welcome gift.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-slate-400 focus:outline-[#8fe40f] focus:border-[#8fe40f]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-[#8fe40f] hover:bg-[#a2f22b] text-[#033d2f] font-bold rounded-lg transition-colors cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-[#f2f3ed]/60">We respect your privacy. No spam ever.</p>
              </form>
            )}

            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#f2f3ed]/80 uppercase tracking-wider block mb-2">
                We Accept
              </span>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="px-2 py-1 rounded bg-black/40 border border-white/10 text-[11px] font-bold">
                  Cash on Delivery
                </span>
                <span className="px-2 py-1 rounded bg-black/40 border border-white/10 text-[11px] font-bold">
                  UPI / Cards
                </span>
              </div>
            </div>
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
