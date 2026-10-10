import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MessageCircle } from 'lucide-react';

export const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-pink-500 selection:text-white">
      {/* Top promotional bar */}
      <AnnouncementBar />

      {/* Main sticky navigation */}
      <Navbar />

      {/* Main page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Slide-over cart drawer */}
      <CartDrawer />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Quick Support Button */}
      <a
        href="https://wa.me/96891234567?text=Hello%20SALALAKART%20ZONE!%20I%20have%20an%20inquiry%20about%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-xl shadow-emerald-500/30 hover:scale-110 transition-all flex items-center justify-center group"
        title="Chat with us on WhatsApp"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          Chat With Us
        </span>
      </a>
    </div>
  );
};
