import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, Address, OrderStatus } from '../types';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  Printer,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react';
import { formatPrice } from '../utils/currency';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { id: orderIdParam } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>(
    location.pathname.includes('/orders') ? 'orders' : 'profile'
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // New address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    recipient_name: '',
    phone: '',
    street: '',
    landmark: '',
    city: 'Salalah',
    state: 'Dhofar',
    postal_code: '211',
    country: 'Oman',
  });

  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login');
      return;
    }

    async function loadData() {
      setLoading(true);
      if (user?.id) {
        // Enforce ownership: only load orders belonging to this user
        const userOrders = await api.getOrders({ userId: user.id });
        setOrders(userOrders);

        // If orderId is in URL, select it
        if (orderIdParam) {
          const matched = await api.getOrderById(orderIdParam);
          if (matched && (matched.user_id === user.id || matched.user_id === 'guest')) {
            setSelectedOrder(matched);
            setActiveTab('orders');
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, [user?.id, isAuthenticated, orderIdParam, navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ full_name: fullName, phone });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Address = {
      id: `addr-${Date.now()}`,
      user_id: user?.id,
      ...newAddr,
      is_default: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, created]);
    setShowAddAddress(false);
    setNewAddr({
      recipient_name: '',
      phone: '',
      street: '',
      landmark: '',
      city: 'Salalah',
      state: 'Dhofar',
      postal_code: '211',
      country: 'Oman',
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      await api.updateOrderStatus(orderId, 'cancelled', 'Cancelled by customer');
      const updated = await api.getOrders({ userId: user?.id });
      setOrders(updated);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, order_status: 'cancelled' } : null);
      }
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="mb-8">
        <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Customer Portal
        </span>
        <h1 className="font-brand font-black text-3xl sm:text-4xl text-slate-900 mt-2">
          Welcome back, {user?.full_name || 'Customer'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Nav (Mobile Horizontal Scrollable Tabs / Desktop Sidebar) */}
        <aside className="bg-white rounded-3xl p-2 sm:p-4 border border-slate-200/80 shadow-xs flex lg:flex-col overflow-x-auto scrollbar-none gap-1.5 lg:gap-0 lg:space-y-1">
          <button
            onClick={() => {
              setActiveTab('profile');
              setSelectedOrder(null);
            }}
            className={`flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 lg:w-full ${
              activeTab === 'profile' && !selectedOrder
                ? 'bg-pink-50 text-pink-600'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('orders');
              setSelectedOrder(null);
            }}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 lg:w-full ${
              activeTab === 'orders'
                ? 'bg-pink-50 text-pink-600'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Package className="w-4 h-4" />
              <span>Order History</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('addresses');
              setSelectedOrder(null);
            }}
            className={`flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 lg:w-full ${
              activeTab === 'addresses'
                ? 'bg-pink-50 text-pink-600'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>

          <Link
            to="/wishlist"
            className="flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 lg:w-full"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Wishlist</span>
          </Link>

          <div className="lg:pt-2 lg:border-t lg:border-slate-100 shrink-0">
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors whitespace-nowrap shrink-0 lg:w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && !selectedOrder && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <h2 className="font-brand font-bold text-xl text-slate-900 pb-3 border-b border-slate-100">
                Personal Information
              </h2>

              {profileSaved && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Managed via Supabase Auth</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+968 9123 4567"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs hover:opacity-95 shadow-md shadow-pink-500/20"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && !selectedOrder && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <h2 className="font-brand font-bold text-xl text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>My Orders</span>
                <span className="text-xs font-normal text-slate-500">{orders.length} orders placed</span>
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 text-base">No orders yet</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    When you purchase toys or gadgets, track their delivery right here.
                  </p>
                  <Link
                    to="/shop"
                    className="px-5 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-700"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-pink-200 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{ord.order_number}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              ord.order_status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.order_status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.order_status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.order_status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Placed on {new Date(ord.created_at).toLocaleDateString()} • {ord.items.length}{' '}
                          {ord.items.length === 1 ? 'item' : 'items'}
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          Total: {formatPrice(ord.total_amount)} ({ord.payment_method.toUpperCase()})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DETAILED ORDER VIEW WITH PRINTABLE INVOICE */}
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
                >
                  ← Back to Orders List
                </button>
                <button
                  onClick={printInvoice}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
              </div>

              {/* Printable Invoice Container */}
              <div id="printable-invoice" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="font-brand font-black text-2xl text-slate-900">
                      SALALAKART ZONE
                    </h2>
                    <p className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">
                      GIFTS, WATCH, GADGETS, TOYS
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Shop 12, Commercial Market Square, Salalah, Oman</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tax Invoice</span>
                    <h3 className="font-mono font-extrabold text-lg text-slate-900">{selectedOrder.order_number}</h3>
                    <p className="text-xs text-slate-500">
                      Date: {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Delivery and Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-slate-800 text-xs mb-2">Delivery Address</h4>
                    <p className="font-semibold text-slate-900">{selectedOrder.customer_name}</p>
                    <p>{selectedOrder.shipping_address.street}</p>
                    {selectedOrder.shipping_address.landmark && <p>{selectedOrder.shipping_address.landmark}</p>}
                    <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.country}</p>
                    <p className="mt-1 text-slate-700">Phone: {selectedOrder.customer_phone}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-slate-800 text-xs mb-2">Order Information</h4>
                    <p>Status: <strong className="uppercase text-pink-600">{selectedOrder.order_status}</strong></p>
                    <p>Payment: <strong className="uppercase text-slate-800">{selectedOrder.payment_method}</strong> ({selectedOrder.payment_status})</p>
                    <p>Shipping: <strong>{selectedOrder.shipping_method_name}</strong></p>
                    {selectedOrder.tracking_number && (
                      <p className="mt-1 text-blue-700 font-bold">
                        Tracking: {selectedOrder.tracking_number} ({selectedOrder.courier_name})
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 no-print">
                  <h4 className="font-bold text-xs text-purple-900 mb-3 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span>Order Fulfillment Timeline</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.status_history?.map((hist, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                        <span className="font-bold uppercase text-[11px] text-purple-800 w-24">
                          {hist.status}
                        </span>
                        <span className="text-slate-600 flex-1">{hist.notes}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(hist.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line Items Table */}
                <div>
                  <table className="w-full text-xs text-left">
                    <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2">Item Description</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Price</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3">
                            <p className="font-bold text-slate-900">{item.product_name}</p>
                            <p className="text-[10px] text-slate-400">SKU: {item.sku}</p>
                            {item.variant_details && (
                              <p className="text-[10px] text-purple-600">{item.variant_details}</p>
                            )}
                          </td>
                          <td className="py-3 text-center font-bold text-slate-700">{item.quantity}</td>
                          <td className="py-3 text-right text-slate-700">{formatPrice(item.price)}</td>
                          <td className="py-3 text-right font-bold text-slate-900">{formatPrice(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount ({selectedOrder.coupon_code})</span>
                        <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping Fee</span>
                      <span>{formatPrice(selectedOrder.shipping_fee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax (5%)</span>
                      <span>{formatPrice(selectedOrder.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Paid / Due</span>
                      <span className="text-pink-600">{formatPrice(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Cancel Action if pending */}
                {selectedOrder.order_status === 'pending' && (
                  <div className="pt-4 border-t border-slate-100 flex justify-end no-print">
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="px-4 py-2 rounded-xl text-rose-600 border border-rose-200 hover:bg-rose-50 text-xs font-bold transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && !selectedOrder && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-brand font-bold text-xl text-slate-900">Saved Addresses</h2>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 max-w-lg">
                  <h3 className="font-bold text-sm text-slate-900">Add New Shipping Address</h3>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={newAddr.recipient_name}
                      onChange={(e) => setNewAddr({ ...newAddr, recipient_name: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Street / House / Villa</label>
                    <input
                      type="text"
                      required
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={newAddr.postal_code}
                        onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border-2 border-pink-500 bg-pink-50/20 relative">
                  <span className="px-2 py-0.5 rounded bg-pink-600 text-white text-[10px] font-bold">
                    Default Delivery Address
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-2">{user?.full_name || 'Customer'}</h4>
                  <p className="text-xs text-slate-600 mt-1">Shop 12, Commercial Market Square</p>
                  <p className="text-xs text-slate-600">Salalah, Dhofar, Oman</p>
                  <p className="text-xs text-slate-600 font-medium mt-2">Phone: {user?.phone || '+968 9123 4567'}</p>
                </div>

                {addresses.map((a) => (
                  <div key={a.id} className="p-4 rounded-2xl border border-slate-200 bg-white relative">
                    <h4 className="font-bold text-sm text-slate-900">{a.recipient_name}</h4>
                    <p className="text-xs text-slate-600 mt-1">{a.street}</p>
                    <p className="text-xs text-slate-600">{a.city}, {a.country}</p>
                    <p className="text-xs text-slate-600 font-medium mt-2">Phone: {a.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
