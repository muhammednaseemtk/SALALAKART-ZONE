import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { CreditCard, Banknote, Smartphone, CheckCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatPrice } from '../../utils/currency';

export const AdminPaymentsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const ords = await api.getOrders();
      setOrders(ords);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve payment records');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalCollected = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingCod = orders
    .filter((o) => o.payment_status === 'pending')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Financial Ledger
          </span>
          <h1 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-1">
            Payment Records & Gateways
          </h1>
          <p className="text-xs text-slate-500">
            Audit payment methods, collected funds and pending receivables (INR)
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Settled / Collected Payments</span>
          <h3 className="font-black text-2xl text-emerald-600">{formatPrice(totalCollected)}</h3>
          <p className="text-[10px] text-slate-400">Verified digital and delivered payments</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Pending Cash on Delivery</span>
          <h3 className="font-black text-2xl text-amber-600">{formatPrice(pendingCod)}</h3>
          <p className="text-[10px] text-slate-400">Due upon courier delivery handover</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Security Compliance</span>
          <h3 className="font-black text-lg text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>PCI-DSS Clean</span>
          </h3>
          <p className="text-[10px] text-slate-400">Raw card details never stored on servers</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-4">
        <h2 className="font-brand font-bold text-lg text-slate-900">Recent Payment Transactions</h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading ledger...</div>
        ) : error ? (
          <div className="py-12 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-rose-700">Failed to load transactions</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
            <button
              onClick={load}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No payment transactions found</p>
            <p className="text-xs text-slate-400 mt-1">Transactions will appear here in real time as customer orders are placed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Order Ref</th>
                  <th className="py-3 px-3">Payer Customer</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{o.order_number}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{o.customer_name}</td>
                    <td className="py-3.5 px-3">
                      <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {o.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900">{formatPrice(o.total_amount)}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
