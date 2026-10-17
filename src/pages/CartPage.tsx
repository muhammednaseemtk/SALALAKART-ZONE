import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../utils/currency';

export const CartPage: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    totalAmount,
    appliedCoupon,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponFeedback(null);
    const res = await applyCoupon(couponCode);
    setApplying(false);
    if (res.success) {
      setCouponFeedback({ type: 'success', msg: res.message });
      setCouponCode('');
    } else {
      setCouponFeedback({ type: 'error', msg: res.message });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-pink-50 text-pink-400 flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
        </div>
        <h1 className="font-brand font-black text-3xl text-slate-900 mb-2">Your Shopping Cart is Empty</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          Looks like you haven't added anything to your cart yet. Discover high-speed RC cars, smart watches, and toys!
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all"
        >
          Explore Catalog & Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Review Bag
          </span>
          <h1 className="font-brand font-black text-3xl sm:text-4xl text-slate-900 mt-2">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-center min-w-0">
                  <img
                    src={item.product.images[0]?.image_url}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-2xl border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600">
                      {item.product.brand}
                    </span>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="font-bold text-sm text-slate-900 hover:text-pink-600 block line-clamp-1 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    {item.selected_variant && (
                      <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium inline-block mt-1">
                        {item.selected_variant.name}: {item.selected_variant.value}
                      </span>
                    )}
                    <p className="text-xs text-slate-500 mt-1 font-semibold">
                      {formatPrice(item.unit_price)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:justify-end">
                  {/* Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 text-xs font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="font-extrabold text-base text-slate-900 block">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/shop"
              className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-brand font-bold text-lg text-slate-900 pb-2 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Coupon Code Section */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Coupon: {appliedCoupon.code}</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 uppercase tracking-wider focus:outline-pink-500"
                  />
                  <button
                    type="submit"
                    disabled={applying || !couponCode.trim()}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {applying ? '...' : 'Apply'}
                  </button>
                </div>
                {couponFeedback && (
                  <p
                    className={`text-xs ${
                      couponFeedback.type === 'success' ? 'text-emerald-600 font-semibold' : 'text-rose-600'
                    }`}
                  >
                    {couponFeedback.msg}
                  </p>
                )}
              </form>
            )}

            {/* Price lines */}
            <div className="space-y-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span>{subtotal >= 75 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Taxes (5%)</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                <span>Estimated Total</span>
                <span className="text-pink-600 text-xl">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
            <p className="flex items-center gap-2 font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure Bank Encrypted Checkout</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
