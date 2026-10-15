import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Order, Product } from '../../types';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Boxes,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReports();
      setStats(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve analytics data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-bold">Calculating real-time analytics from database...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-brand font-bold text-lg text-slate-900">Unable to Load Dashboard Data</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'An unexpected error occurred while fetching database analytics.'}</p>
        </div>
        <button
          onClick={loadStats}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Operational Overview
          </span>
          <h1 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-1">
            Store Performance & Orders
          </h1>
          <p className="text-xs text-slate-500">Live operational data calculated from actual orders and stock</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/products/add"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            to="/admin/inventory"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Boxes className="w-4 h-4 text-purple-600" />
            <span>Adjust Stock</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Sales Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900">${stats.totalSales.toFixed(2)}</h3>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Today's Sales: ${stats.todaysSales.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900">{stats.totalOrders}</h3>
            <p className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{stats.pendingOrdersCount} Pending fulfillment</span>
            </p>
          </div>
        </div>

        {/* Products & Inventory */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Catalog Products</span>
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900">{stats.totalProducts} Items</h3>
            <p className="text-[11px] text-orange-600 font-bold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{stats.lowStockCount} Low stock alerts</span>
            </p>
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Registered Customers</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900">{stats.totalCustomers}</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              Protected by Supabase Auth & RLS
            </p>
          </div>
        </div>
      </div>

      {/* Middle Row: 7-Day Revenue Trend & Inventory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 7-Day Sales Trend Chart Simulation */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-brand font-bold text-base text-slate-900">7-Day Sales & Volume Trend</h3>
              <p className="text-[11px] text-slate-400">Daily revenue breakdown</p>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Gross: ${stats.grossSales.toFixed(2)}
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {stats.last7Days.map((d: any, idx: number) => {
              const maxSale = Math.max(...stats.last7Days.map((x: any) => x.sales), 100);
              const heightPct = Math.max(12, Math.round((d.sales / maxSale) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${d.sales}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-36 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">
                    {d.date.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Alerts & Inventory Health */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-brand font-bold text-base text-slate-900">Urgent Stock Alerts</h3>
            <Link to="/admin/inventory" className="text-xs font-bold text-pink-600 hover:underline">
              Manage →
            </Link>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Healthy Inventory</p>
              <p className="text-[11px] text-slate-400">All products have ample stock quantity.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {stats.lowStockProducts.map((p: Product) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <p className="font-bold text-xs text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-500">SKU: {p.sku}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-extrabold text-[10px] shrink-0">
                    {p.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Orders Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-brand font-bold text-lg text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Live order activity across the website</p>
          </div>
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            View All Orders
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-2">Order #</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Payment</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentOrders.map((ord: Order) => (
                <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-2 font-mono font-bold text-slate-900">
                    {ord.order_number}
                  </td>
                  <td className="py-3.5 px-2">
                    <p className="font-bold text-slate-800">{ord.customer_name}</p>
                    <p className="text-[10px] text-slate-400">{ord.customer_phone}</p>
                  </td>
                  <td className="py-3.5 px-2 text-slate-500">
                    {new Date(ord.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-2 font-bold text-slate-900">
                    ${ord.total_amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-2">
                    <span className="uppercase font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                      {ord.payment_method}
                    </span>
                  </td>
                  <td className="py-3.5 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
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
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <Link
                      to={`/admin/orders/${ord.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-pink-600 font-bold text-[11px] transition-colors"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
