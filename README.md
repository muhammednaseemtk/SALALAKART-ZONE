# SALALAKART ZONE — Complete E-commerce Platform

A modern, colorful, production-ready e-commerce platform developed for **SALALAKART ZONE** (Gifts, Watch, Gadgets, Toys), featuring a complete customer storefront and a separate, role-protected admin control center.

![SALALAKART ZONE](/logo.jpg)

---

## 🌟 Brand Identity & Overview

- **Brand Name**: SALALAKART ZONE
- **Tagline**: GIFTS, WATCH, GADGETS, TOYS
- **Location**: Shop 12, Commercial Market Square, Salalah, Dhofar Governorate, Sultanate of Oman
- **Visual Identity**: Playful 3D colorful typography (Pink, Purple, Cyan, Yellow, Orange, Green), arched rainbow mark with toy train, teddy bear, star, watch, and clean white retail backdrops.

---

## 🚀 Technology Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 with custom brand design tokens
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL 15+, Row Level Security, Triggers & Extensions)
- **Authentication**: Supabase Auth (with offline/local storage fallback layer for evaluation)
- **Image Storage**: Supabase Storage buckets (`product-images`, `banners`, `avatars`)
- **Routing**: React Router v7 with distinct Customer & Admin layouts
- **Cart & Wishlist**: Context API with multi-user isolation & authoritative price calculations
- **Animations & Celebrations**: Canvas Confetti

---

## 🗺️ Application Routes

### Customer Storefront
| Route | Description |
|---|---|
| `/` | Homepage with hero carousel, category pills, trending toys, watches & gadgets, special discounts, reviews |
| `/shop` | Full catalog with category filter, price slider, in-stock filter, brand filter, and sorting |
| `/category/:slug` | Category specific landing showcase with hero header and product grid |
| `/product/:slug` | Product detail page with gallery zoom, variant selection, stock check, specifications, customer reviews form |
| `/search` | Live keyword search for toys, watches, gifts, and gadgets |
| `/cart` | Shopping cart review with quantity steppers, coupon codes, and free shipping progress |
| `/checkout` | 3-step checkout: Delivery Address, Courier selection, Payment method (COD/UPI/Card), order submission |
| `/login` | Customer login with quick 1-click test credentials |
| `/register` | Customer registration (strictly assigns `customer` role) |
| `/forgot-password` | Password recovery request |
| `/account` | Customer profile management |
| `/account/orders` | Order history queue |
| `/account/orders/:id` | Order details with live status timeline and printable tax invoice |
| `/account/addresses` | Manage saved delivery addresses |
| `/wishlist` | Saved wishlist items with 1-click move to cart |
| `/about` | Store story and physical store identity in Salalah |
| `/contact` | Store location, business hours, phone & WhatsApp (+968 9123 4567) |
| `/privacy-policy` | Privacy policy & multi-user RLS data protection |
| `/terms-and-conditions` | Terms of service and store rules |
| `/shipping-policy` | Delivery zones, timelines, and free shipping threshold ($75) |
| `/return-policy` | 7-day exchange and refund policies |

### Staff Admin Dashboard (Protected by Role-Based Authorization)
| Route | Description |
|---|---|
| `/admin/login` | Secure staff authentication screen |
| `/admin/dashboard` | Executive KPI overview: Total sales, today's sales, orders count, stock alerts, 7-day sales chart |
| `/admin/products` | Complete catalog management with search, filter, stock badges, cost price visibility |
| `/admin/products/add` | Add new product: Title, SKU, price, sale price, cost price, stock, variants, images |
| `/admin/products/edit/:id` | Edit all product fields |
| `/admin/categories` | Manage taxonomy: Name, slug, cover image, order, active state, safe deletion checks |
| `/admin/orders` | Order management queue with search and status filters |
| `/admin/orders/:id` | Detailed order fulfillment: Update status (Pending → Shipped → Delivered), assign courier tracking, print tax invoice |
| `/admin/inventory` | Real-time stock levels, low-stock warnings, and stock adjustment audit log |
| `/admin/customers` | Directory of registered customers and order history (passwords never exposed) |
| `/admin/coupons` | Promo code creator: Percentage/fixed discounts, min order amounts, max discount caps, usage counters |
| `/admin/banners` | Manage homepage promotional hero banners and links |
| `/admin/reviews` | Moderate verified buyer reviews (Approve, Reject, Delete) |
| `/admin/payments` | Financial transactions audit ledger (COD vs Digital) |
| `/admin/reports` | Financial metrics breakdown and CSV Export (`salalakart_sales_report.csv`) |
| `/admin/settings` | Store settings: Announcement bar, tax rate, free shipping threshold, payment toggles |

---

## 🔒 Security & Multi-User Architecture

1. **Row Level Security (RLS)**:
   - Enabled on all 24 database tables (`profiles`, `orders`, `order_items`, `addresses`, `user_roles`, etc.).
   - Customers can **only** read and modify their own orders, addresses, wishlists, and profile.
   - Catalog tables (`products`, `categories`, `banners`, `coupons`) allow public read access but require `is_admin()` for mutations.
2. **Multi-User Isolation on Shared Devices**:
   - Cart, wishlist, and session caches are partitioned strictly by `user.id`.
   - Logging out completely purges cached carts, addresses, and private customer tokens, ensuring subsequent users on the same device never see private data.
3. **Role-Based Admin Protection**:
   - Roles are stored in a dedicated `user_roles` table.
   - Users cannot elevate their own role through frontend modification.
   - Admin routes (`/admin/*`) redirect unauthorized users directly to `/admin/login`.
4. **Authoritative Price & Stock Calculations**:
   - Prices, discounts, and inventory decrements are calculated using trusted server logic.
   - Order placement checks available stock atomically before confirming orders, preventing negative inventory.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js v18+ (tested on Node v24)
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

If connecting to Supabase, update `.env` with your project credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Note on Offline / Evaluation Mode**:
> If Supabase credentials are not provided, the application runs on its integrated **Persistent Local Storage Fallback Layer**. All features (CRUD, stock decrement, coupon validation, orders, invoice printing, admin dashboard) work 100% end-to-end with pre-seeded products and demo accounts!

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Quick Demo Login Credentials

For instant evaluation, you can use the pre-configured credentials:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@salalakartzone.com` | `admin123` | Full access to `/admin/*` and customer storefront |
| **Customer** | `customer@salalakartzone.com` | `customer123` | Customer storefront, orders, addresses, wishlist |

You can also click the **"🔑 Instant Login as Demo Admin"** or **"🛍️ Instant Login as Demo Customer"** buttons located directly on the login pages.

---

## 🗄️ Supabase Database Migration & Setup

1. Open your [Supabase Dashboard](https://supabase.com).
2. Navigate to the **SQL Editor**.
3. Copy and run the contents of [`supabase/migrations/20261010_initial_schema.sql`](./supabase/migrations/20261010_initial_schema.sql).
4. Run [`supabase/migrations/20261010_seed_data.sql`](./supabase/migrations/20261010_seed_data.sql) to populate initial categories and shipping methods.
5. In **Storage**, verify buckets `product-images`, `banners`, and `avatars` exist with public read access.

### 🛡️ Secure First-Admin Setup
To designate a trusted account as the store administrator:
1. Register the email through the customer registration form or in Supabase Auth.
2. Open the Supabase SQL Editor and run [`supabase/setup_first_admin.sql`](./supabase/setup_first_admin.sql):
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@salalakartzone.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 💳 Payment Gateway Integration (Razorpay / UPI)

1. Register an account with [Razorpay](https://razorpay.com).
2. Generate your API Key ID and Secret in test mode.
3. Add your Key ID to `.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_...
   ```
4. Set up an edge function or webhook in Supabase to verify signatures securely.
5. Cash on Delivery (COD) and direct UPI QR payments are enabled by default and can be configured in `/admin/settings`.

---

## ☁️ Vercel Deployment Instructions

1. Push your repository to GitHub / GitLab.
2. In [Vercel](https://vercel.com), click **Add New Project** and import the repository.
3. Framework Preset: **Vite**.
4. Set Build Command: `npm run build`.
5. Set Output Directory: `dist`.
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID` (if used)
7. Click **Deploy**. Vercel will automatically build and distribute the app globally on their CDN.

---

## 📄 License & Brand Notice

© 2026 **SALALAKART ZONE**. All rights reserved.
Developed for commercial retail sales of toys, gifts, watches, gadgets and lifestyle accessories.
