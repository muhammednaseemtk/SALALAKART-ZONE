import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  SlidersHorizontal,
  Heart,
  ShoppingCart,
  User,
  MessageCircle,
} from 'lucide-react';

export const StorefrontLayout: React.FC = () => {
  const { itemCount, setIsCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-pink-500 selection:text-white pb-16 md:pb-0">
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
        className="fixed bottom-24 md:bottom-6 right-3 sm:right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:p-3.5 rounded-full shadow-xl shadow-emerald-500/30 hover:scale-110 transition-all flex items-center justify-center group"
        title="Chat with us on WhatsApp"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
        <span className="hidden sm:inline max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          WhatsApp Help
        </span>
      </a>

      {/* Mobile Sticky Bottom Navigation App Bar (Only visible on screens < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
              isActive ? 'text-pink-600' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        {/* Shop */}
        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
              isActive ? 'text-pink-600' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <SlidersHorizontal className="w-5 h-5 mb-0.5" />
          <span>Shop</span>
        </NavLink>

        {/* Cart Drawer Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold text-slate-500 hover:text-pink-600 relative transition-colors"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-pink-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                {itemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* Wishlist */}
        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold relative transition-colors ${
              isActive ? 'text-pink-600' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                {wishlistItems.length}
              </span>
            )}
          </div>
          <span>Wishlist</span>
        </NavLink>

        {/* Account */}
        <NavLink
          to={isAuthenticated ? '/account' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
              isActive ? 'text-pink-600' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
        </NavLink>
      </nav>
    </div>
  );
};
