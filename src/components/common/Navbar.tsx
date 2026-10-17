import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { api } from '../../services/api';
import { useCatalogRealtime } from '../../hooks/useCatalogRealtime';
import { Category, Product } from '../../types';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  SlidersHorizontal,
} from 'lucide-react';
import { formatPrice } from '../../utils/currency';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, totalAmount, setIsCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const reloadCategories = useCallback(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    reloadCategories();
  }, [reloadCategories]);

  // Real-time synchronization for category changes
  useCatalogRealtime(reloadCategories);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchFocused(false);
  }, [location.pathname]);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search auto-suggest
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await api.getProducts({ search: searchQuery, limit: 5 });
      setSearchResults(results.slice(0, 5));
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-100 dark:border-white/10 shadow-xs transition-colors duration-200">
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Logo */}
          <div className="origin-left shrink-0">
            <BrandLogo size="lg" imgClassName="h-[65px] sm:h-[80px] lg:h-[90px]" />
          </div>
        </div>

        {/* Center: Live Search Bar */}
        <div ref={searchRef} className="flex-1 max-w-xl mx-2 hidden sm:block relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search toys, watches, smart gadgets, RC cars, gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-pink-300 focus:border-pink-500 rounded-full py-2.5 pl-11 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Search Live Autocomplete Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>Search results for "{searchQuery}"</span>
                {isSearching && <span className="text-pink-600 font-medium">Searching...</span>}
              </div>

              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                  {searchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      to={`/product/${prod.slug}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="p-3 flex items-center gap-3 hover:bg-pink-50/50 transition-colors"
                    >
                      <img
                        src={prod.images[0]?.image_url}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{prod.name}</p>
                        <p className="text-xs text-slate-500">{prod.brand} • {prod.category_name}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-pink-600">
                          {formatPrice(prod.sale_price || prod.price)}
                        </span>
                        {prod.sale_price && (
                          <span className="text-xs text-slate-400 line-through block">
                            {formatPrice(prod.price)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 bg-slate-50 text-xs font-bold text-pink-600 hover:bg-pink-50 transition-colors text-center block"
                  >
                    View all matching products →
                  </button>
                </div>
              ) : !isSearching ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No matching products found for "{searchQuery}".
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Light / Dark Theme Toggle */}
          <ThemeToggle />

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="relative p-2.5 text-slate-700 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart Icon & Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-95 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
            title="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-xs">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline font-bold text-xs">
              {formatPrice(totalAmount)}
            </span>
          </button>

          {/* User Account Menu */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border border-slate-200 text-slate-700 hover:border-pink-300 hover:bg-pink-50/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 text-white flex items-center justify-center font-bold text-xs">
                {isAuthenticated && user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-slate-700 max-w-[90px] truncate">
                {isAuthenticated ? user?.full_name?.split(' ')[0] : 'Sign In'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="mt-1.5 inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 tracking-wider">
                          Administrator
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-purple-600" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                      <Link
                        to="/account"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/account/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>Order History</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>Saved Wishlist ({wishlistItems.length})</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={async () => {
                          await logout();
                          setIsUserMenuOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-500 mb-3">Welcome to SALALAKART ZONE!</p>
                      <div className="flex flex-col gap-2">
                        <Link
                          to="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="py-2 px-3 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-700 transition-colors"
                        >
                          Sign In to Your Account
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                        >
                          Create New Account
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Live Search Row (< sm screens) */}
      <div className="sm:hidden px-3.5 pb-2.5 pt-0">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search toys, watches, gifts, gadgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-9 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-9 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center hover:opacity-90"
            aria-label="Search"
          >
            <Search className="w-3 h-3" />
          </button>
        </form>
      </div>

      {/* Category Navigation Bar */}
      <nav className="hidden md:block border-t border-slate-100 dark:border-white/10 bg-white dark:bg-black transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none text-xs font-semibold text-slate-700">
            <Link
              to="/shop"
              className="px-3 py-1.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-colors whitespace-nowrap flex items-center gap-1 text-slate-900 font-bold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-pink-500" /> All Categories
            </Link>
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="px-3 py-1.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pl-4 border-l border-slate-100">
            <Link to="/about" className="hover:text-pink-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-pink-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search toys, watches, gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Links */}
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Explore Categories</p>
            <Link
              to="/shop"
              className="block px-3 py-2 rounded-xl font-bold text-pink-600 bg-pink-50 text-sm"
            >
              All Products & Collections
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Information</p>
            <Link to="/about" className="block px-3 py-1.5 text-sm text-slate-600">About Us</Link>
            <Link to="/contact" className="block px-3 py-1.5 text-sm text-slate-600">Contact & Store Location</Link>
            <Link to="/shipping-policy" className="block px-3 py-1.5 text-sm text-slate-600">Shipping Policy</Link>
            <Link to="/return-policy" className="block px-3 py-1.5 text-sm text-slate-600">Returns & Exchanges</Link>
          </div>
        </div>
      )}
    </header>
  );
};
