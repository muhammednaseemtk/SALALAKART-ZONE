import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductVariant, Coupon, ShippingMethod } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  appliedCoupon: Coupon | null;
  selectedShippingMethod: ShippingMethod | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => { success: boolean; message: string };
  updateQuantity: (itemId: string, quantity: number) => { success: boolean; message?: string };
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  setSelectedShippingMethod: (method: ShippingMethod) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [taxRate, setTaxRate] = useState(0.05); // 5% default
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(75.0);

  // Cart key partitioned by user ID to guarantee strict multi-user privacy
  const cartStorageKey = `salalakart_cart_${user?.id || 'guest'}`;

  // Load cart and store settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem(cartStorageKey);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }

    // Load store shipping and settings
    api.getStoreSettings().then((s) => {
      if (s) {
        setTaxRate(s.tax_rate || 0.05);
        setFreeShippingThreshold(s.free_shipping_threshold || 75.0);
      }
    });

    api.getShippingMethods().then((methods) => {
      if (methods.length > 0) {
        setSelectedShippingMethod(methods[0]);
      }
    });
  }, [user?.id, cartStorageKey]);

  // Persist cart items to user-isolated storage key
  useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(items));
  }, [items, cartStorageKey]);

  // Add Item with strict stock validation
  const addItem = (product: Product, quantity = 1, variant?: ProductVariant) => {
    const availableStock = variant ? variant.stock_quantity : product.stock_quantity;

    if (availableStock <= 0) {
      return { success: false, message: 'Sorry, this product is currently out of stock.' };
    }

    const unitPrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price;
    const finalPrice = unitPrice + (variant?.price_adjustment || 0);

    const existingIndex = items.findIndex(
      (item) => item.product_id === product.id && item.variant_id === variant?.id
    );

    if (existingIndex > -1) {
      const existing = items[existingIndex];
      const newQty = existing.quantity + quantity;

      if (newQty > availableStock) {
        return {
          success: false,
          message: `Cannot add more than available stock (${availableStock} items).`,
        };
      }

      const updated = [...items];
      updated[existingIndex] = { ...existing, quantity: newQty };
      setItems(updated);
    } else {
      if (quantity > availableStock) {
        return {
          success: false,
          message: `Only ${availableStock} items available in stock.`,
        };
      }

      const newItem: CartItem = {
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        product_id: product.id,
        product,
        variant_id: variant?.id,
        selected_variant: variant,
        quantity,
        unit_price: finalPrice,
      };
      setItems((prev) => [...prev, newItem]);
    }

    setIsCartOpen(true);
    return { success: true, message: `Added "${product.name}" to cart!` };
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return { success: true, message: 'Item removed' };
    }

    const item = items.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };

    const availableStock = item.selected_variant
      ? item.selected_variant.stock_quantity
      : item.product.stock_quantity;

    if (quantity > availableStock) {
      return {
        success: false,
        message: `Stock limit reached. Only ${availableStock} available.`,
      };
    }

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
    return { success: true };
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem(cartStorageKey);
  };

  // Authoritative price calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = Math.round(
    items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) * 100
  ) / 100;

  // Coupon discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount_amount && discountAmount > appliedCoupon.max_discount_amount) {
        discountAmount = appliedCoupon.max_discount_amount;
      }
    } else {
      discountAmount = Math.min(appliedCoupon.discount_value, subtotal);
    }
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  // Shipping calculation (free if subtotal exceeds freeShippingThreshold)
  let shippingFee = 0;
  if (items.length > 0) {
    if (subtotal >= freeShippingThreshold) {
      shippingFee = 0;
    } else if (selectedShippingMethod) {
      shippingFee = selectedShippingMethod.price;
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;
  const totalAmount = Math.max(0, Math.round((taxableAmount + shippingFee + taxAmount) * 100) / 100);

  const applyCoupon = async (code: string) => {
    const res = await api.validateCoupon(code, subtotal, user?.id);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      return { success: true, message: `Coupon "${res.coupon.code}" applied successfully!` };
    }
    return { success: false, message: res.error || 'Failed to apply coupon.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        totalAmount,
        appliedCoupon,
        selectedShippingMethod,
        isCartOpen,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        setSelectedShippingMethod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
