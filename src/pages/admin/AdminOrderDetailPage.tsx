import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import {
  ArrowLeft,
  Printer,
  Truck,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Package,
  Calendar,
  Save,
} from 'lucide-react';
import { formatPrice } from '../../utils/currency';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Update state
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const data = await api.getOrderById(id);
      if (data) {
        setOrder(data);
        setNewStatus(data.order_status);
        setTrackingNumber(data.tracking_number || '');
        setCourierName(data.courier_name || '');
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setUpdating(true);

    const updated = await api.updateOrderStatus(
      order.id,
      newStatus,
      statusNotes || `Status updated to ${newStatus} by admin`,
      trackingNumber,
      courierName
    );

    setOrder(updated);
    setUpdating(false);
    setSuccessNotice(true);
    setStatusNotes('');
    setTimeout(() => setSuccessNotice(false), 2500);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">Loading order details...</div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/admin/orders" className="text-xs font-bold text-pink-600 hover:underline">
          ← Back to Orders Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/admin/orders"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
        <button
          onClick={handlePrintInvoice}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Customer Invoice</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 no-print">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>Order fulfillment status updated successfully! Inventory synced.</span>
        </div>
      )}

      {/* Admin Status Fulfillment Controls Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4 no-print">
        <h2 className="font-brand font-bold text-base text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Truck className="w-4 h-4 text-purple-600" />
          <span>Update Fulfillment & Courier Tracking</span>
        </h2>

        <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Order Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-pink-500 uppercase"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled (Restore Stock)</option>
              <option value="return_requested">Return Requested</option>
              <option value="returned">Returned (Restore Stock)</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter courier tracking ID"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Courier Carrier</label>
            <input
              type="text"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="e.g. Courier / Delivery Service"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">Status Update Note</label>
            <input
              type="text"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add optional notes for this status update..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{updating ? 'Saving...' : 'Update Order'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* PRINTABLE INVOICE & ORDER SNAPSHOT */}
      <div id="printable-invoice" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="font-brand font-black text-2xl text-slate-900">
              SALALAKART ZONE
            </h2>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">
              GIFTS, WATCH, GADGETS, TOYS
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Shop 12, Commercial Market Square, Salalah, Dhofar Governorate, Oman
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Statement</span>
            <h3 className="font-mono font-black text-xl text-slate-900">{order.order_number}</h3>
            <p className="text-xs text-slate-500">
              Placed: {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">Customer Shipping Address</h4>
            <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
            <p>{order.shipping_address.street}</p>
            {order.shipping_address.landmark && <p>{order.shipping_address.landmark}</p>}
            <p>{order.shipping_address.city}, {order.shipping_address.country}</p>
            <p className="pt-1 text-slate-800 font-semibold">Phone: {order.customer_phone}</p>
            <p className="text-slate-500">Email: {order.customer_email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">Payment & Shipment Info</h4>
            <p>
              Status:{' '}
              <span className="font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                {order.order_status.replace('_', ' ')}
              </span>
            </p>
            <p>
              Payment Method: <strong className="uppercase">{order.payment_method}</strong> ({order.payment_status.toUpperCase()})
            </p>
            <p>Shipping Option: <strong>{order.shipping_method_name}</strong></p>
            {order.tracking_number && (
              <p className="pt-1 text-blue-700 font-mono font-bold">
                Tracking: {order.tracking_number} ({order.courier_name})
              </p>
            )}
            {order.notes && <p className="italic text-slate-500 pt-1">Notes: "{order.notes}"</p>}
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <table className="w-full text-xs text-left">
            <thead className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-2">Item</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-right">Unit Price</th>
                <th className="py-2.5 px-2 text-right">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                        {item.variant_details && (
                          <p className="text-[10px] text-purple-600 font-semibold">{item.variant_details}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-slate-800">{item.quantity}</td>
                  <td className="py-3 px-2 text-right text-slate-700">{formatPrice(item.price)}</td>
                  <td className="py-3 px-2 text-right font-extrabold text-slate-900">{formatPrice(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount Applied ({order.coupon_code})</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span>{formatPrice(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (5%)</span>
              <span>{formatPrice(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="text-pink-600 text-lg">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Audit Status History */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <h4 className="font-bold text-xs text-slate-800">Status History Audit Trail</h4>
          <div className="space-y-1.5">
            {order.status_history?.map((hist, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                <span className="font-bold uppercase text-[10px] text-purple-700 w-24">
                  {hist.status}
                </span>
                <span className="text-slate-600 flex-1">{hist.notes}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(hist.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
