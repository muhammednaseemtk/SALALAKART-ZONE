import { supabase, isSupabaseConfigured } from './supabase';
import { isFirebaseConfigured } from '../lib/firebase';
import { firebaseService } from './firebaseService';
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
import { formatPrice } from '../utils/currency';

// Storage keys for persistent local storage layer (used as offline / pre-configuration fallback)
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
  PAYMENTS: 'salalakart_payments',
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

function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) return INITIAL_PRODUCTS;
    const list: Product[] = JSON.parse(raw);
    return list.length > 0 ? list : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

// Initial customers seed for local storage mode
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

// Initial mock orders to power reports and dashboard when offline
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
    discount_amount: 8.0,
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
        image_url:
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
        variant_details: 'Color: Cotton Candy Pink',
      },
    ],
    status_history: [
      {
        status: 'pending',
        notes: 'Order placed by customer',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        status: 'delivered',
        notes: 'Successfully delivered to customer',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const api = {
  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------
  async getCategories(): Promise<Category[]> {
    if (isFirebaseConfigured) {
      const fbCats = await firebaseService.getCategories();
      if (fbCats && fbCats.length > 0) return fbCats;
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*, products:products(count)')
          .order('display_order', { ascending: true });

        if (!error && data) {
          return data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            image_url: cat.image_url,
            parent_id: cat.parent_id,
            display_order: cat.display_order,
            is_active: cat.is_active,
            product_count: cat.products?.[0]?.count || 0,
            created_at: cat.created_at,
          }));
        }
        if (error) {
          console.warn('Supabase getCategories error, falling back:', error.message);
        }
      } catch (err) {
        console.warn('Supabase getCategories exception:', err);
      }
    }
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cats = await this.getCategories();
    return cats.find((c) => c.slug === slug) || null;
  },

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    if (isFirebaseConfigured) {
      try {
        return await firebaseService.createCategory(cat);
      } catch (err) {
        console.warn('Firebase createCategory error:', err);
      }
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            image_url: cat.image_url,
            parent_id: cat.parent_id || null,
            display_order: cat.display_order || 0,
            is_active: cat.is_active ?? true,
          })
          .select()
          .single();

        if (!error && data) return data;
        if (error) console.error('Supabase createCategory error:', error.message);
      } catch (err) {
        console.error('Supabase createCategory error:', err);
      }
    }

    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const current = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    current.push(newCat);
    setStored(STORAGE_KEYS.CATEGORIES, current);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) return data;
        if (error) console.error('Supabase updateCategory error:', error.message);
      } catch (err) {
        console.error('Supabase updateCategory error:', err);
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
      throw new Error(
        'Cannot delete category: it still has associated products. Please reassign or delete them first.'
      );
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) return true;
        if (error) console.error('Supabase deleteCategory error:', error.message);
      } catch (err) {
        console.error('Supabase deleteCategory error:', err);
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
    if (isFirebaseConfigured) {
      const fbProds = await firebaseService.getProducts(params);
      if (fbProds && fbProds.length > 0) return fbProds;
    }

    let prods: Product[] = [];

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('products').select(`
          *,
          categories:category_id (name, slug),
          product_images (*),
          product_variants (*)
        `);

        if (!params?.includeInactive) query = query.eq('is_active', true);
        if (params?.featured) query = query.eq('is_featured', true);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          prods = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            sku: d.sku,
            slug: d.slug,
            short_description: d.short_description || '',
            description: d.description,
            category_id: d.category_id,
            category_name: d.categories?.name,
            category_slug: d.categories?.slug,
            price: Number(d.price),
            sale_price: d.sale_price !== null && d.sale_price !== undefined ? Number(d.sale_price) : null,
            cost_price: Number(d.cost_price || 0),
            stock_quantity: Number(d.stock_quantity),
            low_stock_threshold: Number(d.low_stock_threshold || 5),
            brand: d.brand || 'Salalakart',
            barcode: d.barcode || undefined,
            weight: d.weight || undefined,
            dimensions: d.dimensions || undefined,
            is_featured: Boolean(d.is_featured),
            is_active: Boolean(d.is_active),
            rating: Number(d.rating || 5.0),
            review_count: Number(d.review_count || 0),
            images: (d.product_images || []).sort(
              (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
            ),
            variants: d.product_variants || [],
            created_at: d.created_at,
            updated_at: d.updated_at,
          }));
        } else if (error) {
          console.warn('Supabase getProducts error, falling back:', error.message);
        }
      } catch (err) {
        console.warn('Supabase getProducts exception:', err);
      }
    }

    if (prods.length === 0) {
      prods = getStoredProducts();
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

  async createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Product> {
    if (isFirebaseConfigured) {
      try {
        return await firebaseService.createProduct(productData);
      } catch (err) {
        console.warn('Firebase createProduct error:', err);
      }
    }

    if (isSupabaseConfigured) {
      try {
        // 1. Insert product row into products table (let Postgres generate UUID)
        const productRow = {
          name: productData.name,
          sku: productData.sku,
          slug: productData.slug,
          short_description: productData.short_description || '',
          description: productData.description,
          category_id: productData.category_id,
          price: productData.price,
          sale_price: productData.sale_price !== null && productData.sale_price !== undefined ? Number(productData.sale_price) : null,
          cost_price: productData.cost_price || 0,
          stock_quantity: productData.stock_quantity || 0,
          low_stock_threshold: productData.low_stock_threshold || 5,
          brand: productData.brand || 'Salalakart',
          barcode: productData.barcode || null,
          weight: productData.weight || null,
          dimensions: productData.dimensions || null,
          is_featured: productData.is_featured || false,
          is_active: productData.is_active ?? true,
          rating: productData.rating || 5.0,
          review_count: productData.review_count || 0,
        };

        const { data: createdProd, error: prodErr } = await supabase
          .from('products')
          .insert(productRow)
          .select()
          .single();

        if (prodErr) throw new Error(prodErr.message);

        // 2. Insert images into product_images table
        if (productData.images && productData.images.length > 0) {
          const imageRows = productData.images.map((img, idx) => ({
            product_id: createdProd.id,
            image_url: img.image_url,
            alt_text: img.alt_text || createdProd.name,
            display_order: img.display_order || idx + 1,
            is_primary: img.is_primary ?? idx === 0,
          }));
          await supabase.from('product_images').insert(imageRows);
        }

        // 3. Insert variants if provided
        if (productData.variants && productData.variants.length > 0) {
          const variantRows = productData.variants.map((v) => ({
            product_id: createdProd.id,
            name: v.name,
            variant_type: v.variant_type,
            value: v.value,
            sku: v.sku || `${createdProd.sku}-${v.value}`,
            price_adjustment: v.price_adjustment || 0,
            stock_quantity: v.stock_quantity || 0,
          }));
          await supabase.from('product_variants').insert(variantRows);
        }

        // 4. Record initial inventory movement
        await supabase.from('inventory_movements').insert({
          product_id: createdProd.id,
          change_type: 'restock',
          quantity_change: createdProd.stock_quantity,
          previous_stock: 0,
          new_stock: createdProd.stock_quantity,
          notes: 'Initial stock on product creation',
        });

        // Retrieve full assembled product
        const fullProd = await this.getProductById(createdProd.id);
        if (fullProd) return fullProd;
      } catch (err: unknown) {
        console.error('Supabase createProduct error:', err);
      }
    }

    // Offline / Local storage fallback
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rating: productData.rating || 5.0,
      review_count: productData.review_count || 0,
    };

    const prods = getStoredProducts();
    prods.unshift(newProd);
    setStored(STORAGE_KEYS.PRODUCTS, prods);

    await this.adjustStock(newProd.id, newProd.stock_quantity, 'restock', 'Initial stock on creation');
    return newProd;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured) {
      try {
        const { images, variants, category_name, category_slug, ...productRowUpdates } = updates;

        const { data, error } = await supabase
          .from('products')
          .update({ ...productRowUpdates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) console.error('Supabase updateProduct error:', error.message);

        // Update images if provided
        if (images && images.length > 0) {
          await supabase.from('product_images').delete().eq('product_id', id);
          const imageRows = images.map((img, idx) => ({
            product_id: id,
            image_url: img.image_url,
            alt_text: img.alt_text || data?.name || 'Product Image',
            display_order: img.display_order || idx + 1,
            is_primary: img.is_primary ?? idx === 0,
          }));
          await supabase.from('product_images').insert(imageRows);
        }

        const fullUpdated = await this.getProductById(id);
        if (fullUpdated) return fullUpdated;
      } catch (err) {
        console.error('Supabase updateProduct error:', err);
      }
    }

    // Local storage update fallback
    const prods = getStoredProducts();
    const index = prods.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const previousStock = prods[index].stock_quantity;
    prods[index] = {
      ...prods[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.PRODUCTS, prods);

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
        if (error) console.error('Supabase deleteProduct error:', error.message);
      } catch (err) {
        console.error('Supabase deleteProduct error:', err);
      }
    }

    const prods = getStoredProducts();
    const filtered = prods.filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  async clearAllProducts(): Promise<void> {
    setStored(STORAGE_KEYS.PRODUCTS, []);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('Supabase clearAllProducts error:', err);
      }
    }
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

  async createBanner(banner: Omit<Banner, 'id' | 'created_at'>): Promise<Banner> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('banners').insert(banner).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createBanner error:', err);
      }
    }
    const newB: Banner = { ...banner, id: `ban-${Date.now()}`, created_at: new Date().toISOString() };
    const list = getStored<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    list.push(newB);
    setStored(STORAGE_KEYS.BANNERS, list);
    return newB;
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('banners').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateBanner error:', err);
      }
    }
    const list = getStored<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Banner not found');
    list[idx] = { ...list[idx], ...updates };
    setStored(STORAGE_KEYS.BANNERS, list);
    return list[idx];
  },

  async deleteBanner(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteBanner error:', err);
      }
    }
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
        let q = supabase.from('coupons').select('*').order('created_at', { ascending: false });
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

  async validateCoupon(code: string, subtotal: number, userId?: string): Promise<{ valid: boolean; discount: number; coupon?: Coupon; error?: string }> {
    const coupons = await this.getCoupons(true);
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());

    if (!coupon) {
      return { valid: false, discount: 0, error: 'Invalid coupon code.' };
    }
    if (!coupon.is_active) {
      return { valid: false, discount: 0, error: 'This coupon is no longer active.' };
    }
    if (new Date(coupon.end_date) < new Date()) {
      return { valid: false, discount: 0, error: 'This coupon has expired.' };
    }
    if (subtotal < coupon.min_order_amount) {
      return {
        valid: false,
        discount: 0,
        error: `Minimum order amount of ${formatPrice(coupon.min_order_amount)} required to use this coupon.`,
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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('coupons').insert({ ...coupon, times_used: 0 }).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createCoupon error:', err);
      }
    }
    const newC: Coupon = { ...coupon, id: `coup-${Date.now()}`, times_used: 0 };
    const list = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    list.push(newC);
    setStored(STORAGE_KEYS.COUPONS, list);
    return newC;
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('coupons').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateCoupon error:', err);
      }
    }
    const list = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Coupon not found');
    list[idx] = { ...list[idx], ...updates };
    setStored(STORAGE_KEYS.COUPONS, list);
    return list[idx];
  },

  async deleteCoupon(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteCoupon error:', err);
      }
    }
    const list = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    setStored(STORAGE_KEYS.COUPONS, list.filter((c) => c.id !== id));
    return true;
  },

  // ----------------------------------------------------
  // SHIPPING METHODS
  // ----------------------------------------------------
  async getShippingMethods(): Promise<ShippingMethod[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('shipping_methods').select('*').eq('is_active', true);
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getShippingMethods error:', err);
      }
    }
    return getStored<ShippingMethod[]>(STORAGE_KEYS.SHIPPING, INITIAL_SHIPPING_METHODS);
  },

  // ----------------------------------------------------
  // ORDERS
  // ----------------------------------------------------
  async getOrders(params?: { userId?: string; status?: OrderStatus; search?: string }): Promise<Order[]> {
    if (isFirebaseConfigured) {
      const fbOrders = await firebaseService.getOrders(params?.userId);
      if (fbOrders && fbOrders.length > 0) return fbOrders;
    }

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('orders').select(`
          *,
          order_items (*),
          order_status_history (*)
        `).order('created_at', { ascending: false });

        if (params?.userId) query = query.eq('user_id', params.userId);
        if (params?.status) query = query.eq('order_status', params.status);

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          let mapped: Order[] = data.map((o: any) => ({
            id: o.id,
            order_number: o.order_number,
            user_id: o.user_id,
            customer_name: o.customer_name,
            customer_email: o.customer_email,
            customer_phone: o.customer_phone,
            shipping_address: o.shipping_address,
            shipping_method_id: o.shipping_method_id,
            shipping_method_name: o.shipping_method_name,
            payment_method: o.payment_method,
            payment_status: o.payment_status,
            order_status: o.order_status,
            tracking_number: o.tracking_number,
            courier_name: o.courier_name,
            subtotal: Number(o.subtotal),
            discount_amount: Number(o.discount_amount || 0),
            coupon_code: o.coupon_code,
            shipping_fee: Number(o.shipping_fee || 0),
            tax_amount: Number(o.tax_amount || 0),
            total_amount: Number(o.total_amount),
            notes: o.notes,
            items: (o.order_items || []).map((i: any) => ({
              id: i.id,
              product_id: i.product_id,
              product_name: i.product_name,
              sku: i.sku,
              price: Number(i.price),
              quantity: Number(i.quantity),
              total_price: Number(i.total_price),
              image_url: i.image_url,
              variant_details: i.variant_details,
            })),
            status_history: (o.order_status_history || []).map((h: any) => ({
              id: h.id,
              order_id: h.order_id,
              status: h.status,
              notes: h.notes,
              created_at: h.created_at,
            })),
            created_at: o.created_at,
            updated_at: o.updated_at,
          }));

          if (params?.search) {
            const q = params.search.toLowerCase();
            mapped = mapped.filter(
              (o) =>
                o.order_number.toLowerCase().includes(q) ||
                o.customer_name.toLowerCase().includes(q) ||
                o.customer_phone.toLowerCase().includes(q) ||
                o.customer_email.toLowerCase().includes(q)
            );
          }
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getOrders error:', err);
      }
    }

    let orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

    if (params?.userId) orders = orders.filter((o) => o.user_id === params.userId);
    if (params?.status) orders = orders.filter((o) => o.order_status === params.status);
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

  async createOrder(
    orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'status_history'>
  ): Promise<Order> {
    if (isFirebaseConfigured) {
      try {
        return await firebaseService.createOrder(orderInput);
      } catch (err) {
        console.warn('Firebase createOrder error:', err);
      }
    }

    // 1. Decrement inventory
    for (const item of orderInput.items) {
      await this.adjustStock(
        item.product_id,
        -item.quantity,
        'order_placed',
        `Sold ${item.quantity} units in order checkout`
      );
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SZ-${randomSuffix}`;

    if (isSupabaseConfigured) {
      try {
        const orderRow = {
          order_number: orderNumber,
          user_id: orderInput.user_id || null,
          customer_name: orderInput.customer_name,
          customer_email: orderInput.customer_email,
          customer_phone: orderInput.customer_phone,
          shipping_address: orderInput.shipping_address,
          shipping_method_id: orderInput.shipping_method_id || null,
          shipping_method_name: orderInput.shipping_method_name,
          payment_method: orderInput.payment_method,
          payment_status: orderInput.payment_status || 'pending',
          order_status: orderInput.order_status || 'pending',
          tracking_number: orderInput.tracking_number || null,
          courier_name: orderInput.courier_name || null,
          subtotal: orderInput.subtotal,
          discount_amount: orderInput.discount_amount || 0,
          coupon_code: orderInput.coupon_code || null,
          shipping_fee: orderInput.shipping_fee || 0,
          tax_amount: orderInput.tax_amount || 0,
          total_amount: orderInput.total_amount,
          notes: orderInput.notes || null,
        };

        const { data: createdOrder, error: orderErr } = await supabase
          .from('orders')
          .insert(orderRow)
          .select()
          .single();

        if (!orderErr && createdOrder) {
          // Insert order items
          const itemRows = orderInput.items.map((i) => ({
            order_id: createdOrder.id,
            product_id: i.product_id,
            product_name: i.product_name,
            sku: i.sku,
            price: i.price,
            quantity: i.quantity,
            total_price: i.total_price,
            image_url: i.image_url,
            variant_details: i.variant_details || null,
          }));
          await supabase.from('order_items').insert(itemRows);

          // Insert initial status history
          await supabase.from('order_status_history').insert({
            order_id: createdOrder.id,
            status: createdOrder.order_status,
            notes: 'Order placed by customer',
          });

          // Insert payment record into payments ledger in INR
          await supabase.from('payments').insert({
            order_id: createdOrder.id,
            provider: orderInput.payment_method.toUpperCase(),
            transaction_id: `TXN-${createdOrder.order_number}`,
            amount: createdOrder.total_amount,
            currency: 'INR',
            status: createdOrder.payment_status || 'pending',
          });

          const fullOrder = await this.getOrderById(createdOrder.id);
          if (fullOrder) return fullOrder;
        }
      } catch (err) {
        console.error('Supabase createOrder error:', err);
      }
    }

    // Local fallback
    const newOrder: Order = {
      ...orderInput,
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
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
    id: string,
    status: OrderStatus,
    notes?: string,
    trackingNumber?: string,
    courierName?: string
  ): Promise<Order> {
    if (isSupabaseConfigured) {
      try {
        const updates: any = {
          order_status: status,
          updated_at: new Date().toISOString(),
        };
        if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
        if (courierName !== undefined) updates.courier_name = courierName;

        await supabase.from('orders').update(updates).eq('id', id);

        // Add history record
        await supabase.from('order_status_history').insert({
          order_id: id,
          status: status,
          notes: notes || `Status changed to ${status}`,
        });

        const updated = await this.getOrderById(id);
        if (updated) return updated;
      } catch (err) {
        console.error('Supabase updateOrderStatus error:', err);
      }
    }

    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const updated = {
      ...orders[index],
      order_status: status,
      tracking_number: trackingNumber || orders[index].tracking_number,
      courier_name: courierName || orders[index].courier_name,
      updated_at: new Date().toISOString(),
      status_history: [
        ...orders[index].status_history,
        {
          id: `hist-${Date.now()}`,
          order_id: id,
          status,
          notes: notes || `Status updated to ${status}`,
          created_at: new Date().toISOString(),
        },
      ],
    };

    orders[index] = updated;
    setStored(STORAGE_KEYS.ORDERS, orders);
    return updated;
  },

  // ----------------------------------------------------
  // INVENTORY
  // ----------------------------------------------------
  async getInventory(): Promise<{ products: Product[]; movements: InventoryMovement[] }> {
    const products = await this.getProducts({ includeInactive: true });

    let movements: InventoryMovement[] = [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('inventory_movements')
          .select('*, products:product_id(name, sku)')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          movements = data.map((m: any) => ({
            id: m.id,
            product_id: m.product_id,
            product_name: m.products?.name || 'Product',
            product_sku: m.products?.sku || '',
            change_type: m.change_type,
            quantity_change: m.quantity_change,
            previous_stock: m.previous_stock,
            new_stock: m.new_stock,
            notes: m.notes || '',
            created_by: m.created_by || 'admin',
            created_at: m.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getInventory movements error:', err);
      }
    }

    if (movements.length === 0) {
      movements = getStored<InventoryMovement[]>(STORAGE_KEYS.INVENTORY, []);
    }

    return { products, movements };
  },

  async getInventoryMovements(): Promise<InventoryMovement[]> {
    const inv = await this.getInventory();
    return inv.movements;
  },

  async adjustStock(
    productId: string,
    quantityChange: number,
    changeType: 'restock' | 'order_placed' | 'order_cancelled' | 'manual_adjustment' | 'return',
    notes?: string
  ): Promise<void> {
    const prod = await this.getProductById(productId);
    if (!prod) return;

    const previousStock = prod.stock_quantity;
    const newStock = Math.max(0, previousStock + quantityChange);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('products')
          .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
          .eq('id', productId);

        await supabase.from('inventory_movements').insert({
          product_id: productId,
          change_type: changeType,
          quantity_change: quantityChange,
          previous_stock: previousStock,
          new_stock: newStock,
          notes: notes || '',
        });
        return;
      } catch (err) {
        console.warn('Supabase adjustStock error:', err);
      }
    }

    // Local fallback
    const prods = getStoredProducts();
    const idx = prods.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      prods[idx].stock_quantity = newStock;
      setStored(STORAGE_KEYS.PRODUCTS, prods);
    }

    const movements = getStored<InventoryMovement[]>(STORAGE_KEYS.INVENTORY, []);
    movements.unshift({
      id: `mov-${Date.now()}`,
      product_id: productId,
      product_name: prod.name,
      product_sku: prod.sku,
      change_type: changeType,
      quantity_change: quantityChange,
      previous_stock: previousStock,
      new_stock: newStock,
      notes: notes || '',
      created_by: 'admin',
      created_at: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.INVENTORY, movements.slice(0, 100));
  },

  // ----------------------------------------------------
  // REVIEWS
  // ----------------------------------------------------
  async getReviews(productId?: string, includeUnapproved = false): Promise<Review[]> {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('reviews').select('*, products:product_id(name)').order('created_at', { ascending: false });
        if (productId) q = q.eq('product_id', productId);
        if (!includeUnapproved) q = q.eq('is_approved', true);

        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map((r: any) => ({
            id: r.id,
            product_id: r.product_id,
            product_name: r.products?.name,
            user_id: r.user_id,
            customer_name: r.customer_name,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            is_verified_purchase: r.is_verified_purchase,
            is_approved: r.is_approved,
            created_at: r.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getReviews error:', err);
      }
    }

    let list = getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (productId) list = list.filter((r) => r.product_id === productId);
    return includeUnapproved ? list : list.filter((r) => r.is_approved);
  },

  async submitReview(review: Omit<Review, 'id' | 'created_at' | 'is_approved'>): Promise<Review> {
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      is_approved: true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('reviews').insert(newRev).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase submitReview error:', err);
      }
    }

    const list = getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    list.unshift(newRev);
    setStored(STORAGE_KEYS.REVIEWS, list);
    return newRev;
  },

  async updateReviewStatus(id: string, isApproved: boolean): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('reviews').update({ is_approved: isApproved }).eq('id', id);
        return true;
      } catch (err) {
        console.warn('Supabase updateReviewStatus error:', err);
      }
    }
    const list = getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const idx = list.findIndex((r) => r.id === id);
    if (idx !== -1) {
      list[idx].is_approved = isApproved;
      setStored(STORAGE_KEYS.REVIEWS, list);
    }
    return true;
  },

  async deleteReview(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('reviews').delete().eq('id', id);
        return true;
      } catch (err) {
        console.warn('Supabase deleteReview error:', err);
      }
    }
    const list = getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    setStored(STORAGE_KEYS.REVIEWS, list.filter((r) => r.id !== id));
    return true;
  },

  // ----------------------------------------------------
  // PAYMENTS & LEDGER
  // ----------------------------------------------------
  async getPayments() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*, orders:order_id(order_number, customer_name, customer_email)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            order_id: p.order_id,
            order_number: p.orders?.order_number,
            customer_name: p.orders?.customer_name,
            provider: p.provider,
            transaction_id: p.transaction_id,
            amount: Number(p.amount),
            currency: p.currency,
            status: p.status,
            created_at: p.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getPayments error:', err);
      }
    }

    // Synthesize ledger from existing orders
    const orders = await this.getOrders();
    return orders.map((o) => ({
      id: `pay-${o.id}`,
      order_id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name,
      provider: o.payment_method.toUpperCase(),
      transaction_id: `TXN-${o.order_number}`,
      amount: o.total_amount,
      currency: 'INR',
      status: o.payment_status,
      created_at: o.created_at,
    }));
  },

  // ----------------------------------------------------
  // STORE SETTINGS
  // ----------------------------------------------------
  async getStoreSettings(): Promise<StoreSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'general_settings')
          .maybeSingle();

        if (!error && data?.value) {
          return { ...DEFAULT_STORE_SETTINGS, ...data.value };
        }
      } catch (err) {
        console.warn('Supabase getStoreSettings error:', err);
      }
    }
    return getStored<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_STORE_SETTINGS);
  },

  async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const next = { ...current, ...updates };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('store_settings').upsert({
          key: 'general_settings',
          value: next,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase updateStoreSettings error:', err);
      }
    }

    setStored(STORAGE_KEYS.SETTINGS, next);
    return next;
  },

  // ----------------------------------------------------
  // CUSTOMERS
  // ----------------------------------------------------
  async getCustomers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, phone, avatar_url, created_at, updated_at, user_roles:user_roles(role)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            email: p.email,
            full_name: p.full_name,
            phone: p.phone || '',
            avatar_url: p.avatar_url || '',
            role: p.user_roles?.[0]?.role === 'admin' ? 'admin' : 'customer',
            created_at: p.created_at,
            updated_at: p.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getCustomers error:', err);
      }
    }
    return getStored<UserProfile[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  // ----------------------------------------------------
  // REPORTS & REAL-TIME ANALYTICS
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

    const lowStockProducts = products.filter(
      (p) => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
    );
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
        date: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
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
