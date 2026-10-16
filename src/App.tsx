import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts
import { StorefrontLayout } from './components/common/StorefrontLayout';
import { AdminLayout } from './components/admin/AdminLayout';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AccountPage } from './pages/AccountPage';
import { WishlistPage } from './pages/WishlistPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PolicyPages } from './pages/PolicyPages';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* Customer Website Routes */}
                <Route element={<StorefrontLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/account/profile" element={<AccountPage />} />
                  <Route path="/account/addresses" element={<AccountPage />} />
                  <Route path="/account/orders" element={<AccountPage />} />
                  <Route path="/account/orders/:id" element={<AccountPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy-policy" element={<PolicyPages />} />
                  <Route path="/terms-and-conditions" element={<PolicyPages />} />
                  <Route path="/shipping-policy" element={<PolicyPages />} />
                  <Route path="/return-policy" element={<PolicyPages />} />
                </Route>

                {/* Admin Login (Public for Staff) */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Dashboard Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/add" element={<AdminProductFormPage />} />
                  <Route path="products/edit/:id" element={<AdminProductFormPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="coupons" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="banners" element={<AdminBannersPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="payments" element={<AdminPaymentsPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* 404 Catch-All */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
                      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 max-w-md w-full space-y-4">
                        <span className="text-4xl">🎈</span>
                        <h1 className="font-brand font-black text-2xl text-slate-900">Page Not Found</h1>
                        <p className="text-xs text-slate-500">
                          The page you are looking for doesn't exist or has moved.
                        </p>
                        <a
                          href="/"
                          className="inline-block px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs"
                        >
                          Return Home
                        </a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
