import { supabase, isSupabaseConfigured } from './supabase';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_COUPONS,
  INITIAL_SHIPPING_METHODS,
  INITIAL_REVIEWS,
  DEFAULT_STORE_SETTINGS,
} from './mockData';
import {
  Category,
  Product,
  Banner,
  Coupon,
  ShippingMethod,
  Order,
  OrderStatus,
  Review,
  InventoryMovement,
  StoreSettings,
  UserProfile,
} from '../types';

// Storage keys for persistent local storage layer
const STORAGE_KEYS = {
  CATEGORIES: 'salalakart_categories',
  PRODUCTS: 'salalakart_products',
  BANNERS: 'salalakart_banners',
  COUPONS: 'salalakart_coupons',
  ORDERS: 'salalakart_orders',
  REVIEWS: 'salalakart_reviews',
  SHIPPING: 'salalakart_shipping',
  INVENTORY: 'salalakart_inventory',
  SETTINGS: 'salalakart_settings',
  CUSTOMERS: 'salalakart_customers',
};

// Helper to get / set from localStorage
function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving to localStorage key ${key}:`, err);
  }
}

// Initial customers seed
const INITIAL_CUSTOMERS: UserProfile[] = [
  {
    id: 'cust-1',
    email: 'amina.harthy@example.com',
    full_name: 'Amina Al-Harthy',
    phone: '+968 9123 4455',
    role: 'customer',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'cust-2',
    email: 'rohan.sharma@example.com',
    full_name: 'Rohan Sharma',
    phone: '+968 9876 5432',
    role: 'customer',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'cust-3',
    email: 'sarah.j@example.com',
    full_name: 'Sarah Jenkins',
    phone: '+968 9555 1234',
    role: 'customer',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// Initial mock orders to power reports and dashboard immediately
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    order_number: 'SZ-90214',
    user_id: 'cust-1',
    customer_name: 'Amina Al-Harthy',
    customer_email: 'amina.harthy@example.com',
    customer_phone: '+968 9123 4455',
    shipping_address: {
      id: 'addr-1',
      recipient_name: 'Amina Al-Harthy',
      phone: '+968 9123 4455',
      street: 'Villa 14, Al-Saada North',
      landmark: 'Near Sultan Qaboos Hospital',
      city: 'Salalah',
      state: 'Dhofar',
      postal_code: '211',
      country: 'Oman',
      is_default: true,
    },
    shipping_method_id: 'ship-std',
    shipping_method_name: 'Standard Doorstep Delivery',
    payment_method: 'cod',
    payment_status: 'paid',
    order_status: 'delivered',
    tracking_number: 'OM-EXP-882190',
    courier_name: 'Oman Post Express',
    subtotal: 79.99,
    discount_amount: 8.00,
    coupon_code: 'WELCOME10',
    shipping_fee: 4.99,
    tax_amount: 3.85,
    total_amount: 80.83,
    items: [
      {
        id: 'ord-item-1',
        product_id: 'prod-2',
        product_name: 'KidiGlow 4G GPS Smart Watch for Kids',
        sku: 'SKU-WAT-002',
        price: 79.99,
        quantity: 1,
        total_price: 79.99,
        image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
        variant_details: 'Color: Cotton Candy Pink',
      },
    ],
    status_history: [
      { status: 'pending', notes: 'Order placed by customer', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
      { status: 'confirmed', notes: 'Payment on delivery confirmed', created_at: new Date(Date.now() - 3.8 * 86400000).toISOString() },
      { status: 'shipped', notes: 'Dispatched via Oman Post', created_at: new Date(Date.now() - 2.5 * 86400000).toISOString() },
      { status: 'delivered', notes: 'Successfully delivered to customer', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
    ],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'ord-1002',
    order_number: 'SZ-90215',
    user_id: 'cust-2',
    customer_name: 'Rohan Sharma',
    customer_email: 'rohan.sharma@example.com',
    customer_phone: '+968 9876 5432',
    shipping_address: {
      id: 'addr-2',
      recipient_name: 'Rohan Sharma',
      phone: '+968 9876 5432',
      street: 'Flat 302, Palm Residency',
      landmark: 'Next to Lulu Hypermarket',
      city: 'Salalah',
      state: 'Dhofar',
      postal_code: '211',
      country: 'Oman',
      is_default: true,
    },
    shipping_method_id: 'ship-exp',
    shipping_method_name: 'Express Priority Courier',
    payment_method: 'upi',
    payment_status: 'paid',
    order_status: 'shipped',
    tracking_number: 'OM-AIR-441209',
    courier_name: 'Salalah Express Air',
    subtotal: 67.98,
    discount_amount: 0,
    shipping_fee: 9.99,
    tax_amount: 3.90,
    total_amount: 81.87,
    items: [
      {
        id: 'ord-item-2',
        product_id: 'prod-1',
        product_name: 'ThunderSpeed 4WD High-Speed Stunt RC Car',
        sku: 'SKU-RC-001',
        price: 34.99,
        quantity: 1,
        total_price: 34.99,
        image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
        variant_details: 'Color: Electric Cyan',
      },
      {
        id: 'ord-item-3',
        product_id: 'prod-4',
        product_name: 'Wireless Bluetooth Karaoke Microphone',
        sku: 'SKU-GAD-004',
        price: 24.99,
        quantity: 1,
        total_price: 24.99,
        image_url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=800&q=80',
      },
    ],
    status_history: [
      { status: 'pending', notes: 'Order placed by customer', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { status: 'confirmed', notes: 'Payment verified via UPI', created_at: new Date(Date.now() - 1.9 * 86400000).toISOString() },
      { status: 'processing', notes: 'Packed with bubble wrap', created_at: new Date(Date.now() - 1.5 * 86400000).toISOString() },
      { status: 'shipped', notes: 'Handed over to courier driver', created_at: new Date(Date.now() - 0.8 * 86400000).toISOString() },
    ],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 0.8 * 86400000).toISOString(),
  },
  {
    id: 'ord-1003',
    order_number: 'SZ-90216',
    user_id: 'cust-3',
    customer_name: 'Sarah Jenkins',
    customer_email: 'sarah.j@example.com',
    customer_phone: '+968 9555 1234',
    shipping_address: {
      id: 'addr-3',
      recipient_name: 'Sarah Jenkins',
      phone: '+968 9555 1234',
      street: 'House 8, Beach Walkway',
      landmark: 'Near Al Haffa Souq',
      city: 'Salalah',
      state: 'Dhofar',
      postal_code: '211',
      country: 'Oman',
      is_default: true,
    },
    shipping_method_id: 'ship-std',
    shipping_method_name: 'Standard Doorstep Delivery',
    payment_method: 'cod',
    payment_status: 'pending',
    order_status: 'pending',
    subtotal: 32.99,
    discount_amount: 0,
    shipping_fee: 4.99,
    tax_amount: 1.90,
    total_amount: 39.88,
    items: [
      {
        id: 'ord-item-4',
        product_id: 'prod-6',
        product_name: 'Astronaut Galaxy Starry Sky Projector Lamp',
        sku: 'SKU-SMT-006',
        price: 32.99,
        quantity: 1,
        total_price: 32.99,
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      },
    ],
    status_history: [
      { status: 'pending', notes: 'Order placed by customer', created_at: new Date().toISOString() },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initial inventory logs
const INITIAL_INVENTORY_LOGS: InventoryMovement[] = [
  {
    id: 'inv-1',
    product_id: 'prod-1',
    product_name: 'ThunderSpeed 4WD High-Speed Stunt RC Car',
    product_sku: 'SKU-RC-001',
    change_type: 'restock',
    quantity_change: 50,
    previous_stock: 0,
    new_stock: 50,
    notes: 'Initial warehouse intake',
    created_by: 'Admin',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'inv-2',
    product_id: 'prod-1',
    product_name: 'ThunderSpeed 4WD High-Speed Stunt RC Car',
    product_sku: 'SKU-RC-001',
    change_type: 'order_placed',
    quantity_change: -1,
    previous_stock: 43,
    new_stock: 42,
    notes: 'Deducted for order SZ-90215',
    created_by: 'System',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const api = {
  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getCategories error, falling back to local store:', err);
      }
    }
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cats = await this.getCategories();
    return cats.find((c) => c.slug === slug) || null;
  },

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('categories').insert(newCat).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createCategory error:', err);
      }
    }
    const current = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    current.push(newCat);
    setStored(STORAGE_KEYS.CATEGORIES, current);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateCategory error:', err);
      }
    }
    const current = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    current[index] = { ...current[index], ...updates };
    setStored(STORAGE_KEYS.CATEGORIES, current);
    return current[index];
  },

  async deleteCategory(id: string): Promise<boolean> {
    // Check if category has associated products
    const products = await this.getProducts({ includeInactive: true });
    const hasProducts = products.some((p) => p.category_id === id);
    if (hasProducts) {
      throw new Error('Cannot delete category: it still has associated products. Please reassign or delete them first.');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteCategory error:', err);
      }
    }
    const current = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const filtered = current.filter((c) => c.id !== id);
    setStored(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  },

  // ----------------------------------------------------
  // PRODUCTS
  // ----------------------------------------------------
  async getProducts(params?: {
    categorySlug?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    featured?: boolean;
    sort?: 'featured' | 'price-asc' | 'price-desc' | 'latest' | 'rating';
    includeInactive?: boolean;
    limit?: number;
    page?: number;
  }): Promise<Product[]> {
    let prods: Product[] = [];
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('products').select('*, product_images(*), product_variants(*)');
        if (!params?.includeInactive) query = query.eq('is_active', true);
        if (params?.featured) query = query.eq('is_featured', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          prods = data.map((d) => ({
            ...d,
            images: d.product_images || [],
            variants: d.product_variants || [],
          }));
        }
      } catch (err) {
        console.warn('Supabase getProducts error, falling back:', err);
      }
    }

    if (prods.length === 0) {
      prods = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }

    // Apply filtering
    if (!params?.includeInactive) {
      prods = prods.filter((p) => p.is_active);
    }
    if (params?.featured) {
      prods = prods.filter((p) => p.is_featured);
    }
    if (params?.categorySlug) {
      prods = prods.filter((p) => p.category_slug === params.categorySlug);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (params?.brand) {
      prods = prods.filter((p) => p.brand.toLowerCase() === params.brand?.toLowerCase());
    }
    if (params?.minPrice !== undefined) {
      prods = prods.filter((p) => (p.sale_price || p.price) >= (params.minPrice || 0));
    }
    if (params?.maxPrice !== undefined) {
      prods = prods.filter((p) => (p.sale_price || p.price) <= (params.maxPrice || 0));
    }

    // Sorting
    switch (params?.sort) {
      case 'price-asc':
        prods.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        break;
      case 'price-desc':
        prods.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        break;
      case 'latest':
        prods.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'rating':
        prods.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        prods.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return prods;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const prods = await this.getProducts({ includeInactive: true });
    return prods.find((p) => p.slug === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const prods = await this.getProducts({ includeInactive: true });
    return prods.find((p) => p.id === id) || null;
  },

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rating: productData.rating || 5.0,
      review_count: productData.review_count || 0,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('products').insert(newProd).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createProduct error:', err);
      }
    }

    const prods = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    prods.unshift(newProd);
    setStored(STORAGE_KEYS.PRODUCTS, prods);

    // Record initial inventory movement
    await this.adjustStock(newProd.id, newProd.stock_quantity, 'restock', 'Initial stock on creation');

    return newProd;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateProduct error:', err);
      }
    }

    const prods = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = prods.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const previousStock = prods[index].stock_quantity;
    prods[index] = {
      ...prods[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.PRODUCTS, prods);

    // If stock quantity was modified manually, record inventory movement
    if (updates.stock_quantity !== undefined && updates.stock_quantity !== previousStock) {
      const diff = updates.stock_quantity - previousStock;
      await this.adjustStock(
        id,
        diff,
        'manual_adjustment',
        `Admin adjusted stock from ${previousStock} to ${updates.stock_quantity}`
      );
    }

    return prods[index];
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteProduct error:', err);
      }
    }

    const prods = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const filtered = prods.filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  // ----------------------------------------------------
  // BANNERS
  // ----------------------------------------------------
  async getBanners(includeInactive = false): Promise<Banner[]> {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('banners').select('*').order('display_order', { ascending: true });
        if (!includeInactive) q = q.eq('is_active', true);
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getBanners error:', err);
      }
    }
    const banners = getStored<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    return includeInactive ? banners : banners.filter((b) => b.is_active);
  },

  async createBanner(banner: Omit<Banner, 'id'>): Promise<Banner> {
    const newB: Banner = { ...banner, id: `ban-${Date.now()}` };
    const list = getStored<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    list.push(newB);
    setStored(STORAGE_KEYS.BANNERS, list);
    return newB;
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner> {
    const list = getStored<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Banner not found');
    list[idx] = { ...list[idx], ...updates };
    setStored(STORAGE_KEYS.BANNERS, list);
    return list[idx];
  },

  async deleteBanner(id: string): Promise<boolean> {
    const list = getStored<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    setStored(STORAGE_KEYS.BANNERS, list.filter((b) => b.id !== id));
    return true;
  },

  // ----------------------------------------------------
  // COUPONS
  // ----------------------------------------------------
  async getCoupons(includeInactive = false): Promise<Coupon[]> {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('coupons').select('*');
        if (!includeInactive) q = q.eq('is_active', true);
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getCoupons error:', err);
      }
    }
    const coupons = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    return includeInactive ? coupons : coupons.filter((c) => c.is_active);
  },

  async validateCoupon(code: string, subtotal: number, _userId?: string): Promise<{ valid: boolean; discount: number; coupon?: Coupon; error?: string }> {
    const coupons = await this.getCoupons(false);
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return { valid: false, discount: 0, error: 'Invalid coupon code.' };
    }
    if (!coupon.is_active) {
      return { valid: false, discount: 0, error: 'This coupon is no longer active.' };
    }
    if (subtotal < coupon.min_order_amount) {
      return {
        valid: false,
        discount: 0,
        error: `Minimum order amount of $${coupon.min_order_amount.toFixed(2)} required to use this coupon.`,
      };
    }
    if (coupon.times_used >= coupon.usage_limit) {
      return { valid: false, discount: 0, error: 'Coupon usage limit reached.' };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = Math.min(coupon.discount_value, subtotal);
    }

    return { valid: true, discount: Math.round(discount * 100) / 100, coupon };
  },

  async createCoupon(coupon: Omit<Coupon, 'id' | 'times_used'>): Promise<Coupon> {
    const newC: Coupon = { ...coupon, id: `coup-${Date.now()}`, times_used: 0 };
    const list = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    list.push(newC);
    setStored(STORAGE_KEYS.COUPONS, list);
    return newC;
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const list = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Coupon not found');
    list[idx] = { ...list[idx], ...updates };
    setStored(STORAGE_KEYS.COUPONS, list);
    return list[idx];
  },

  async deleteCoupon(id: string): Promise<boolean> {
    const list = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    setStored(STORAGE_KEYS.COUPONS, list.filter((c) => c.id !== id));
    return true;
  },

  // ----------------------------------------------------
  // SHIPPING METHODS
  // ----------------------------------------------------
  async getShippingMethods(): Promise<ShippingMethod[]> {
    return getStored<ShippingMethod[]>(STORAGE_KEYS.SHIPPING, INITIAL_SHIPPING_METHODS);
  },

  // ----------------------------------------------------
  // ORDERS
  // ----------------------------------------------------
  async getOrders(params?: { userId?: string; status?: OrderStatus; search?: string }): Promise<Order[]> {
    let orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

    if (params?.userId) {
      orders = orders.filter((o) => o.user_id === params.userId);
    }
    if (params?.status) {
      orders = orders.filter((o) => o.order_status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q)
      );
    }

    return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id || o.order_number === id) || null;
  },

  async createOrder(orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'status_history'>): Promise<Order> {
    // 1. Validate real stock availability
    const products = await this.getProducts({ includeInactive: true });
    for (const item of orderInput.items) {
      const prod = products.find((p) => p.id === item.product_id);
      if (!prod) {
        throw new Error(`Product "${item.product_name}" is no longer available.`);
      }
      if (prod.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${item.product_name}". Only ${prod.stock_quantity} left in stock.`);
      }
    }

    // 2. Decrement inventory atomically and record movement
    for (const item of orderInput.items) {
      const prod = products.find((p) => p.id === item.product_id)!;
      await this.adjustStock(
        prod.id,
        -item.quantity,
        'order_placed',
        `Sold ${item.quantity} units in order placement`
      );
    }

    // 3. Increment coupon usage if used
    if (orderInput.coupon_code) {
      const coupons = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
      const cIdx = coupons.findIndex((c) => c.code.toUpperCase() === orderInput.coupon_code?.toUpperCase());
      if (cIdx !== -1) {
        coupons[cIdx].times_used += 1;
        setStored(STORAGE_KEYS.COUPONS, coupons);
      }
    }

    // 4. Generate Order
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      ...orderInput,
      id: `ord-${Date.now()}`,
      order_number: `SZ-${randomSuffix}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status_history: [
        {
          id: `hist-${Date.now()}`,
          order_id: `ord-${Date.now()}`,
          status: orderInput.order_status || 'pending',
          notes: 'Order placed by customer',
          created_at: new Date().toISOString(),
        },
      ],
    };

    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    orders.unshift(newOrder);
    setStored(STORAGE_KEYS.ORDERS, orders);

    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string,
    trackingNumber?: string,
    courierName?: string
  ): Promise<Order> {
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const previousStatus = orders[idx].order_status;
    orders[idx].order_status = status;
    orders[idx].updated_at = new Date().toISOString();
    if (trackingNumber) orders[idx].tracking_number = trackingNumber;
    if (courierName) orders[idx].courier_name = courierName;

    // Auto mark payment as paid if delivered
    if (status === 'delivered' && orders[idx].payment_status === 'pending') {
      orders[idx].payment_status = 'paid';
    }

    // Append to status history
    orders[idx].status_history.push({
      id: `hist-${Date.now()}`,
      order_id: orderId,
      status,
      notes: notes || `Order status updated to ${status}`,
      created_at: new Date().toISOString(),
    });

    // If order was cancelled or returned, replenish inventory
    if ((status === 'cancelled' || status === 'returned') && previousStatus !== 'cancelled' && previousStatus !== 'returned') {
      for (const item of orders[idx].items) {
        await this.adjustStock(
          item.product_id,
          item.quantity,
          status === 'cancelled' ? 'order_cancelled' : 'return',
          `Restocked ${item.quantity} items from ${status} order ${orders[idx].order_number}`
        );
      }
    }

    setStored(STORAGE_KEYS.ORDERS, orders);
    return orders[idx];
  },

  // ----------------------------------------------------
  // INVENTORY & STOCK
  // ----------------------------------------------------
  async getInventoryMovements(productId?: string): Promise<InventoryMovement[]> {
    const logs = getStored<InventoryMovement[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY_LOGS);
    if (productId) {
      return logs.filter((l) => l.product_id === productId);
    }
    return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async adjustStock(
    productId: string,
    quantityChange: number,
    changeType: InventoryMovement['change_type'],
    notes: string,
    createdBy = 'Admin'
  ): Promise<Product> {
    const prods = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const idx = prods.findIndex((p) => p.id === productId);
    if (idx === -1) throw new Error('Product not found for inventory adjustment');

    const prev = prods[idx].stock_quantity;
    const next = Math.max(0, prev + quantityChange);
    prods[idx].stock_quantity = next;
    setStored(STORAGE_KEYS.PRODUCTS, prods);

    // Record movement
    const logs = getStored<InventoryMovement[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY_LOGS);
    logs.unshift({
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      product_id: productId,
      product_name: prods[idx].name,
      product_sku: prods[idx].sku,
      change_type: changeType,
      quantity_change: quantityChange,
      previous_stock: prev,
      new_stock: next,
      notes,
      created_by: createdBy,
      created_at: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.INVENTORY, logs);

    return prods[idx];
  },

  // ----------------------------------------------------
  // REVIEWS
  // ----------------------------------------------------
  async getReviews(productId?: string): Promise<Review[]> {
    const revs = getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (productId) {
      return revs.filter((r) => r.product_id === productId && r.is_approved);
    }
    return revs;
  },

  async submitReview(review: Omit<Review, 'id' | 'created_at' | 'is_approved'>): Promise<Review> {
    const newR: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
      is_approved: true, // Auto approve or pending
    };
    const revs = getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    revs.unshift(newR);
    setStored(STORAGE_KEYS.REVIEWS, revs);

    // Update product rating and count
    const prods = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const pIdx = prods.findIndex((p) => p.id === review.product_id);
    if (pIdx !== -1) {
      const prodRevs = revs.filter((r) => r.product_id === review.product_id && r.is_approved);
      const avg = prodRevs.reduce((acc, r) => acc + r.rating, 0) / prodRevs.length;
      prods[pIdx].rating = Math.round(avg * 10) / 10;
      prods[pIdx].review_count = prodRevs.length;
      setStored(STORAGE_KEYS.PRODUCTS, prods);
    }

    return newR;
  },

  async updateReviewStatus(id: string, isApproved: boolean): Promise<Review> {
    const revs = getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const idx = revs.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Review not found');
    revs[idx].is_approved = isApproved;
    setStored(STORAGE_KEYS.REVIEWS, revs);
    return revs[idx];
  },

  async deleteReview(id: string): Promise<boolean> {
    const revs = getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    setStored(STORAGE_KEYS.REVIEWS, revs.filter((r) => r.id !== id));
    return true;
  },

  // ----------------------------------------------------
  // STORE SETTINGS
  // ----------------------------------------------------
  async getStoreSettings(): Promise<StoreSettings> {
    return getStored<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_STORE_SETTINGS);
  },

  async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = getStored<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_STORE_SETTINGS);
    const next = { ...current, ...updates };
    setStored(STORAGE_KEYS.SETTINGS, next);
    return next;
  },

  // ----------------------------------------------------
  // CUSTOMERS
  // ----------------------------------------------------
  async getCustomers(): Promise<UserProfile[]> {
    return getStored<UserProfile[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  // ----------------------------------------------------
  // REPORTS & ANALYTICS
  // ----------------------------------------------------
  async getReports() {
    const orders = await this.getOrders();
    const products = await this.getProducts({ includeInactive: true });
    const customers = await this.getCustomers();

    const totalSales = orders
      .filter((o) => o.payment_status === 'paid' || o.order_status === 'delivered')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const grossSales = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalDiscounts = orders.reduce((sum, o) => sum + o.discount_amount, 0);
    const totalShippingRevenue = orders.reduce((sum, o) => sum + o.shipping_fee, 0);
    const totalTax = orders.reduce((sum, o) => sum + o.tax_amount, 0);

    const today = new Date().toISOString().slice(0, 10);
    const todaysOrders = orders.filter((o) => o.created_at.startsWith(today));
    const todaysSales = todaysOrders.reduce((sum, o) => sum + o.total_amount, 0);

    const pendingOrders = orders.filter((o) => o.order_status === 'pending');
    const completedOrders = orders.filter((o) => o.order_status === 'delivered');

    const lowStockProducts = products.filter((p) => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0);
    const outOfStockProducts = products.filter((p) => p.stock_quantity === 0);

    // Sales by day (last 7 days)
    const last7Days: { date: string; sales: number; ordersCount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter((o) => o.created_at.slice(0, 10) === dateStr);
      const daySales = dayOrders.reduce((acc, o) => acc + o.total_amount, 0);
      last7Days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        sales: Math.round(daySales * 100) / 100,
        ordersCount: dayOrders.length,
      });
    }

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      todaysSales: Math.round(todaysSales * 100) / 100,
      grossSales: Math.round(grossSales * 100) / 100,
      totalDiscounts: Math.round(totalDiscounts * 100) / 100,
      totalShippingRevenue: Math.round(totalShippingRevenue * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalOrders: orders.length,
      pendingOrdersCount: pendingOrders.length,
      completedOrdersCount: completedOrders.length,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalCustomers: customers.length,
      recentOrders: orders.slice(0, 5),
      last7Days,
      lowStockProducts,
    };
  },
};
