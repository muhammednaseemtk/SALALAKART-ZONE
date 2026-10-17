import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ShippingMethod, PaymentMethod, Address } from '../types';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  Lock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { formatPrice, toPaise } from '../utils/currency';

export const CheckoutPage: React.FC = () => {
  const {
    items,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    appliedCoupon,
    selectedShippingMethod,
    setSelectedShippingMethod,
    clearCart,
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [formData, setFormData] = useState({
    recipient_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '+968 9123 4567',
    street: 'Shop 12, Commercial Market Square',
    landmark: 'Near Central Souq',
    city: 'Salalah',
    state: 'Dhofar',
    postal_code: '211',
    country: 'Oman',
    order_notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    api.getShippingMethods().then((methods) => {
      setShippingMethods(methods);
      if (methods.length > 0 && !selectedShippingMethod) {
        setSelectedShippingMethod(methods[0]);
      }
    });
  }, [items.length, navigate, selectedShippingMethod, setSelectedShippingMethod]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submission

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const shippingAddress: Address = {
        id: `addr-${Date.now()}`,
        recipient_name: formData.recipient_name,
        phone: formData.phone,
        street: formData.street,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        is_default: true,
      };

      // Validate current product data, active status, and stock before checkout
      for (const item of items) {
        const liveProd = await api.getProductById(item.product_id);
        if (!liveProd || !liveProd.is_active) {
          throw new Error(`"${item.product.name}" is no longer available in the store catalog. Please remove it from your cart.`);
        }
        const availableStock = item.variant_id && liveProd.variants
          ? (liveProd.variants.find((v) => v.id === item.variant_id)?.stock_quantity ?? liveProd.stock_quantity)
          : liveProd.stock_quantity;
        if (item.quantity > availableStock) {
          throw new Error(`Insufficient stock for "${liveProd.name}". Only ${availableStock} units available.`);
        }
      }

      const orderItems = items.map((i) => ({
        id: `ord-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        product_id: i.product_id,
        variant_id: i.variant_id,
        product_name: i.product.name,
        sku: i.selected_variant ? i.selected_variant.sku : i.product.sku,
        price: i.unit_price,
        quantity: i.quantity,
        total_price: i.unit_price * i.quantity,
        image_url: i.product.images[0]?.image_url || '',
        variant_details: i.selected_variant ? `${i.selected_variant.name}: ${i.selected_variant.value}` : undefined,
      }));

      const finalShippingFee = subtotal >= 75 ? 0 : selectedShippingMethod?.price || 4.99;

      const newOrder = await api.createOrder({
        user_id: user?.id || 'guest',
        customer_name: formData.recipient_name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: shippingAddress,
        shipping_method_id: selectedShippingMethod?.id || 'ship-std',
        shipping_method_name: selectedShippingMethod?.name || 'Standard Delivery',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        order_status: 'pending',
        subtotal,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon?.code,
        shipping_fee: finalShippingFee,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: formData.order_notes,
        items: orderItems,
      });

      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EC4899', '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981'],
      });

      // Clear cart
      clearCart();

      // Navigate to order confirmation
      navigate(`/account/orders/${newOrder.id}`, { state: { justPlaced: true } });
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please check item stock.';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="mb-8">
        <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Secure Checkout
        </span>
        <h1 className="font-brand font-black text-3xl sm:text-4xl text-slate-900 mt-2">
          Complete Your Order
        </h1>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit encrypted checkout. Your payment and address are safe.</span>
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left 2 Cols: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Contact & Delivery Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="font-brand font-bold text-lg text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Contact & Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Recipient Name *</label>
                <input
                  type="text"
                  name="recipient_name"
                  required
                  value={formData.recipient_name}
                  onChange={handleChange}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                  placeholder="e.g. Amina Al-Harthy"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address (For Updates) *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (For Delivery SMS) *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                  placeholder="+968 9123 4567"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City / Region *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                  placeholder="Salalah"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Street Address, Villa or Flat # *</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                  placeholder="Villa 24, Road 14, Al-Saada"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                  placeholder="Near Sultan Qaboos Hospital"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  disabled
                  value="Oman"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Delivery Notes (Optional)</label>
                <textarea
                  name="order_notes"
                  rows={2}
                  value={formData.order_notes}
                  onChange={handleChange}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                  placeholder="Please leave package at front porch or ring doorbell..."
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="font-brand font-bold text-lg text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Shipping Method</span>
            </h2>

            <div className="space-y-3">
              {shippingMethods.map((method) => {
                const isSelected = selectedShippingMethod?.id === method.id;
                const isFree = subtotal >= 75;

                return (
                  <label
                    key={method.id}
                    onClick={() => setSelectedShippingMethod(method)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{method.name}</p>
                        <p className="text-[11px] text-slate-500">{method.description} • {method.estimated_days}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isFree ? (
                        <span className="font-bold text-xs text-emerald-600">FREE (₹75+ Order)</span>
                      ) : (
                        <span className="font-extrabold text-xs text-slate-900">{formatPrice(method.price)}</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="font-brand font-bold text-lg text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Select Payment Method</span>
            </h2>

            <div className="space-y-3">
              {/* Cash on delivery */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-pink-600 bg-pink-50/50 ring-2 ring-pink-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-slate-500">Pay cash directly when our courier driver arrives</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-pink-600 bg-pink-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'cod' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </label>

              {/* UPI */}
              <label
                onClick={() => setPaymentMethod('upi')}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-pink-600 bg-pink-50/50 ring-2 ring-pink-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">UPI / QR Code Scan</p>
                    <p className="text-[11px] text-slate-500">Instant digital payment via phone banking</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'upi' ? 'border-pink-600 bg-pink-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'upi' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </label>

              {/* Debit/Credit Card */}
              <label
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-pink-600 bg-pink-50/50 ring-2 ring-pink-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-cyan-600" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">Credit / Debit Card</p>
                    <p className="text-[11px] text-slate-500">Visa, Mastercard, RuPay & NetBanking supported</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-pink-600 bg-pink-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'card' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Order Items Review & Final Price Breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-brand font-bold text-lg text-slate-900 pb-2 border-b border-slate-100">
              Items in Order ({items.length})
            </h3>

            {/* Compact items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs items-center justify-between">
                  <div className="flex gap-2 items-center min-w-0">
                    <img
                      src={item.product.images[0]?.image_url}
                      alt=""
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 pt-3 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>
                  {subtotal >= 75 ? (
                    <strong className="text-emerald-600">FREE</strong>
                  ) : (
                    formatPrice(selectedShippingMethod?.price || 4.99)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Taxes (5%)</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount Due</span>
                <span className="text-pink-600 text-xl">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order ({formatPrice(totalAmount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
