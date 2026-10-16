import { Category, Product, Banner, Coupon, ShippingMethod, Review, StoreSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_BANNERS: Banner[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_COUPONS: Coupon[] = [];

export const INITIAL_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'ship-std',
    name: 'Standard Doorstep Delivery',
    description: 'Safe handling with SMS updates',
    price: 4.99,
    estimated_days: '3-5 Business Days',
    is_active: true,
  },
  {
    id: 'ship-exp',
    name: 'Express Priority Courier',
    description: 'Air dispatch with real-time tracking',
    price: 9.99,
    estimated_days: '1-2 Business Days',
    is_active: true,
  },
  {
    id: 'ship-sameday',
    name: 'Super Speed Same-Day Delivery',
    description: 'Order before 2 PM for city zone delivery',
    price: 14.99,
    estimated_days: 'Today (Within 6 Hours)',
    is_active: true,
  },
];

export const INITIAL_REVIEWS: Review[] = [];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_name: 'SALALAKART ZONE',
  tagline: 'GIFTS, WATCH, GADGETS, TOYS',
  contact_email: 'support@salalakartzone.com',
  contact_phone: '+968 9123 4567',
  whatsapp_number: '+968 9123 4567',
  address: 'Shop 12, Commercial Market Square',
  city: 'Salalah',
  country: 'Oman',
  currency_symbol: '₹',
  currency_code: 'INR',
  tax_rate: 0.05, // 5%
  free_shipping_threshold: 75.00,
  announcement_bar_text: '🎉 Welcome to SALALAKART ZONE! Get 10% OFF with code WELCOME10 • Free delivery on orders over ₹75!',
  is_announcement_enabled: false,
  razorpay_key_id: '',
  is_razorpay_enabled: false,
  is_cod_enabled: true,
  is_upi_enabled: true,
};
