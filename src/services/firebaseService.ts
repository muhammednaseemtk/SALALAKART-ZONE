import {
  db,
  isFirebaseConfigured,
  checkFirebaseUserIsAdmin,
  uploadFileToFirebaseStorage,
} from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Category,
  Product,
  Banner,
  Coupon,
  Order,
  OrderStatus,
  Review,
  InventoryMovement,
  StoreSettings,
  UserProfile,
} from '../types';

export const firebaseService = {
  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------
  async getCategories(): Promise<Category[]> {
    if (!isFirebaseConfigured) return [];
    try {
      const colRef = collection(db, 'categories');
      const q = query(colRef, orderBy('display_order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Category, 'id'>),
      }));
    } catch (err) {
      console.warn('Firebase getCategories error:', err);
      return [];
    }
  },

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const colRef = collection(db, 'categories');
    const docRef = await addDoc(colRef, {
      ...cat,
      created_at: new Date().toISOString(),
    });
    return {
      id: docRef.id,
      ...cat,
      created_at: new Date().toISOString(),
    };
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const docRef = doc(db, 'categories', id);
    await updateDoc(docRef, updates);
  },

  async deleteCategory(id: string): Promise<void> {
    const docRef = doc(db, 'categories', id);
    await deleteDoc(docRef);
  },

  // ----------------------------------------------------
  // PRODUCTS
  // ----------------------------------------------------
  async getProducts(params?: {
    categorySlug?: string;
    search?: string;
    featured?: boolean;
    includeInactive?: boolean;
  }): Promise<Product[]> {
    if (!isFirebaseConfigured) return [];
    try {
      const colRef = collection(db, 'products');
      let q = query(colRef, orderBy('created_at', 'desc'));

      if (!params?.includeInactive) {
        q = query(colRef, where('is_active', '==', true), orderBy('created_at', 'desc'));
      }

      const snapshot = await getDocs(q);
      let products: Product[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Product, 'id'>),
      }));

      if (params?.featured) {
        products = products.filter((p) => p.is_featured);
      }
      if (params?.categorySlug) {
        products = products.filter((p) => p.category_slug === params.categorySlug);
      }
      if (params?.search) {
        const term = params.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.sku.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term)
        );
      }
      return products;
    } catch (err) {
      console.warn('Firebase getProducts error:', err);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    if (!isFirebaseConfigured) return null;
    try {
      const docRef = doc(db, 'products', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
      }
      return null;
    } catch (err) {
      console.warn('Firebase getProductById error:', err);
      return null;
    }
  },

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const colRef = collection(db, 'products');
    const now = new Date().toISOString();
    const docRef = await addDoc(colRef, {
      ...productData,
      created_at: now,
      updated_at: now,
    });

    // Record inventory movement in Firestore
    await addDoc(collection(db, 'inventory_movements'), {
      product_id: docRef.id,
      product_name: productData.name,
      product_sku: productData.sku,
      change_type: 'restock',
      quantity_change: productData.stock_quantity,
      previous_stock: 0,
      new_stock: productData.stock_quantity,
      notes: 'Initial stock on creation via Firebase',
      created_by: 'admin',
      created_at: now,
    });

    return {
      id: docRef.id,
      ...productData,
      created_at: now,
      updated_at: now,
    };
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  },

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  },

  // ----------------------------------------------------
  // ORDERS
  // ----------------------------------------------------
  async getOrders(userId?: string): Promise<Order[]> {
    if (!isFirebaseConfigured) return [];
    try {
      const colRef = collection(db, 'orders');
      let q = query(colRef, orderBy('created_at', 'desc'));

      if (userId) {
        q = query(colRef, where('user_id', '==', userId), orderBy('created_at', 'desc'));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, 'id'>),
      }));
    } catch (err) {
      console.warn('Firebase getOrders error:', err);
      return [];
    }
  },

  async createOrder(
    orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'status_history'>
  ): Promise<Order> {
    const now = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SZ-${randomSuffix}`;

    const newOrder: Order = {
      ...orderInput,
      id: '',
      order_number: orderNumber,
      created_at: now,
      updated_at: now,
      status_history: [
        {
          id: `hist-${Date.now()}`,
          order_id: '',
          status: orderInput.order_status || 'pending',
          notes: 'Order placed by customer via Firebase',
          created_at: now,
        },
      ],
    };

    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    newOrder.id = docRef.id;
    newOrder.status_history[0].order_id = docRef.id;
    await updateDoc(docRef, { id: docRef.id });

    // Decrement stock for purchased items
    for (const item of orderInput.items) {
      const prodRef = doc(db, 'products', item.product_id);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const currentStock = prodSnap.data()?.stock_quantity || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        await updateDoc(prodRef, { stock_quantity: newStock });

        await addDoc(collection(db, 'inventory_movements'), {
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.sku,
          change_type: 'order_placed',
          quantity_change: -item.quantity,
          previous_stock: currentStock,
          new_stock: newStock,
          notes: `Order ${orderNumber} placed`,
          created_by: 'system',
          created_at: now,
        });
      }
    }

    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus, notes?: string): Promise<void> {
    const docRef = doc(db, 'orders', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const orderData = snap.data() as Order;
    const history = orderData.status_history || [];
    history.push({
      id: `hist-${Date.now()}`,
      order_id: id,
      status,
      notes: notes || `Status updated to ${status}`,
      created_at: new Date().toISOString(),
    });

    await updateDoc(docRef, {
      order_status: status,
      status_history: history,
      updated_at: new Date().toISOString(),
    });
  },

  // ----------------------------------------------------
  // STORE SETTINGS
  // ----------------------------------------------------
  async getStoreSettings(): Promise<StoreSettings | null> {
    if (!isFirebaseConfigured) return null;
    try {
      const docRef = doc(db, 'store_settings', 'general_settings');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as StoreSettings;
      }
      return null;
    } catch (err) {
      console.warn('Firebase getStoreSettings error:', err);
      return null;
    }
  },

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
    const docRef = doc(db, 'store_settings', 'general_settings');
    await setDoc(docRef, settings, { merge: true });
  },

  // ----------------------------------------------------
  // PROFILES & CUSTOMERS
  // ----------------------------------------------------
  async getCustomers(): Promise<UserProfile[]> {
    if (!isFirebaseConfigured) return [];
    try {
      const colRef = collection(db, 'profiles');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<UserProfile, 'id'>),
      }));
    } catch (err) {
      console.warn('Firebase getCustomers error:', err);
      return [];
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const docRef = doc(db, 'profiles', profile.id);
    await setDoc(docRef, profile, { merge: true });
  },

  async setUserRole(userId: string, role: 'customer' | 'admin'): Promise<void> {
    const docRef = doc(db, 'user_roles', userId);
    await setDoc(docRef, {
      user_id: userId,
      role: role,
      updated_at: new Date().toISOString(),
    });
  },
};
