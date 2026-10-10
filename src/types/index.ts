export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Address {
  id: string;
  user_id?: string;
  recipient_name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  parent_id?: string | null;
  display_order: number;
  is_active: boolean;
  product_count?: number;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  name: string;
  variant_type: 'color' | 'size' | 'model' | 'style';
  value: string;
  sku: string;
  price_adjustment: number;
  stock_quantity: number;
}

export interface ProductImage {
  id: string;
  product_id?: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  price: number;
  sale_price?: number | null;
  cost_price: number; // For admin only
  stock_quantity: number;
  low_stock_threshold: number;
  brand: string;
  barcode?: string;
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  weight?: string;
  dimensions?: string;
  images: ProductImage[];
  variants?: ProductVariant[];
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  variant_id?: string;
  selected_variant?: ProductVariant;
  quantity: number;
  unit_price: number;
}

export interface WishlistItem {
  id: string;
  user_id?: string;
  product_id: string;
  product: Product;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  start_date: string;
  end_date: string;
  usage_limit: number;
  per_customer_limit: number;
  times_used: number;
  is_active: boolean;
  created_at?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_days: string;
  is_active: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'cod' | 'razorpay' | 'upi' | 'card';

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  sku: string;
  price: number;
  quantity: number;
  total_price: number;
  image_url: string;
  variant_details?: string;
}

export interface OrderStatusHistory {
  id?: string;
  order_id?: string;
  status: OrderStatus;
  notes?: string;
  created_by?: string;
  created_at: string;
}


export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  shipping_method_id: string;
  shipping_method_name?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  tracking_number?: string;
  courier_name?: string;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  product_name?: string;
  user_id: string;
  customer_name: string;
  customer_avatar?: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  link_url: string;
  badge_text?: string;
  display_order: number;
  is_active: boolean;
  bg_gradient?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  change_type: 'restock' | 'order_placed' | 'order_cancelled' | 'manual_adjustment' | 'return';
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  notes: string;
  created_by: string;
  created_at: string;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  address: string;
  city: string;
  country: string;
  currency_symbol: string;
  currency_code: string;
  tax_rate: number; // e.g. 5%
  free_shipping_threshold: number;
  announcement_bar_text: string;
  is_announcement_enabled: boolean;
  razorpay_key_id?: string;
  is_razorpay_enabled: boolean;
  is_cod_enabled: boolean;
  is_upi_enabled: boolean;
}
