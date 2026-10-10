import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Order, Product } from '../../types';
import { BarChart3, Download, Calendar, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [data, ords] = await Promise.all([api.getReports(), api.getOrders()]);
      setStats(data);
      setOrders(ords);
      setLoading(false);
    }
    load();
  }, []);

  const handleExportCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      'Order Number',
      'Date',
      'Customer',
      'Email',
      'Phone',
      'Subtotal',
      'Discount',
      'Shipping Fee',
      'Tax',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Order Status',
    ];

    const rows = orders.map((o) => [
      o.order_number,
      new Date(o.created_at).toISOString().slice(0, 10),
      `"${o.customer_name}"`,
      o.customer_email,
      `"${o.customer_phone}"`,
      o.subtotal.toFixed(2),
      o.discount_amount.toFixed(2),
      o.shipping_fee.toFixed(2),
      o.tax_amount.toFixed(2),
      o.total_amount.toFixed(2),
      o.payment_method,
      o.payment_status,
      o.order_status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `salalakart_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !stats) {
    return <div className="py-20 text-center text-xs text-slate-400">Compiling financial reports...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Business Intelligence
          </span>
          <h1 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-1">
            Reports & Export Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Export comprehensive revenue statements and customer conversion reports
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Gross Merchandise Value</span>
          <h3 className="font-black text-2xl text-slate-900">${stats.grossSales.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-400">Total catalog items pre-discount value</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Coupons & Discounts Given</span>
          <h3 className="font-black text-2xl text-rose-600">-${stats.totalDiscounts.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-400">Promotions & customer savings</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Shipping Revenue</span>
          <h3 className="font-black text-2xl text-blue-600">+${stats.totalShippingRevenue.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-400">Courier delivery charges collected</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Settled Revenue</span>
          <h3 className="font-black text-2xl text-emerald-600">${stats.totalSales.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-400">Total net incoming revenue</p>
        </div>
      </div>

      {/* Daily Sales Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h2 className="font-brand font-bold text-lg text-slate-900">Recent 7-Day Performance Log</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Orders Volume</th>
                <th className="py-3 px-3">Daily Gross Sales</th>
                <th className="py-3 px-3">Avg Order Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.last7Days.map((d: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{d.date}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-700">{d.ordersCount} orders</td>
                  <td className="py-3.5 px-3 font-black text-slate-900">${d.sales.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-slate-500">
                    ${d.ordersCount > 0 ? (d.sales / d.ordersCount).toFixed(2) : '0.00'}
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
