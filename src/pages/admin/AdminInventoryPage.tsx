import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useCatalogRealtime } from '../../hooks/useCatalogRealtime';
import { Product, InventoryMovement } from '../../types';
import { Boxes, Plus, AlertTriangle, ArrowUpDown, History, Save, CheckCircle2, IndianRupee } from 'lucide-react';
import { formatPrice } from '../../utils/currency';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Adjustment modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityChange, setQuantityChange] = useState<number>(10);
  const [changeType, setChangeType] = useState<InventoryMovement['change_type']>('restock');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, moves] = await Promise.all([
        api.getProducts({ includeInactive: true }),
        api.getInventoryMovements(),
      ]);
      setProducts(prods);
      setMovements(moves);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve inventory data');
      setProducts([]);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time synchronization
  useCatalogRealtime(loadData);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);

    const actualChange = changeType === 'order_placed' || changeType === 'manual_adjustment' && quantityChange < 0
      ? quantityChange
      : quantityChange;

    await api.adjustStock(
      selectedProduct.id,
      actualChange,
      changeType,
      notes || `Stock adjusted via inventory manager`
    );

    setSubmitting(false);
    setSuccessMsg(true);
    setSelectedProduct(null);
    setNotes('');
    loadData();
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  const lowStockProducts = products.filter((p) => p.stock_quantity <= p.low_stock_threshold);
  const totalValuation = products.reduce((acc, p) => acc + (p.cost_price || p.price) * p.stock_quantity, 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + (p.sale_price || p.price) * p.stock_quantity, 0);
  const totalUnits = products.reduce((acc, p) => acc + p.stock_quantity, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Warehouse & Supply
          </span>
          <h1 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-1">
            Inventory & Stock Audit
          </h1>
          <p className="text-xs text-slate-500">
            Real-time stock quantities and immutable movement audit trails
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Stock updated and movement logged successfully!</span>
        </div>
      )}

      {/* Inventory Valuation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Inventory Valuation (Cost)</span>
          <h3 className="font-black text-2xl text-slate-900">{formatPrice(totalValuation)}</h3>
          <p className="text-[10px] text-slate-400">Calculated across {totalUnits} warehouse units</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Estimated Retail Value</span>
          <h3 className="font-black text-2xl text-emerald-600">{formatPrice(totalRetailValuation)}</h3>
          <p className="text-[10px] text-slate-400">Total catalog market selling price</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Stock Health Status</span>
          <h3 className="font-black text-2xl text-slate-800 flex items-center gap-1.5">
            <Boxes className="w-6 h-6 text-purple-600" />
            <span>{totalUnits} Units</span>
          </h3>
          <p className="text-[10px] text-slate-400">{lowStockProducts.length} low stock warnings</p>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Low Stock Warning: {lowStockProducts.length} items require replenishment</p>
              <p className="text-orange-700">Prevent out-of-stock lost sales by placing warehouse purchase orders.</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Stock Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6">
        <h2 className="font-brand font-bold text-lg text-slate-900">Current Stock Levels</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Cost / Unit</th>
                <th className="py-3 px-3">In Stock</th>
                <th className="py-3 px-3">Valuation</th>
                <th className="py-3 px-3">Threshold</th>
                <th className="py-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No products in catalog to manage inventory. Add products first.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.brand}</p>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">{p.sku}</td>
                  <td className="py-3 px-3 text-slate-600">{p.category_name}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{formatPrice(p.cost_price || p.price)}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        p.stock_quantity <= 0
                          ? 'bg-rose-100 text-rose-800'
                          : p.stock_quantity <= p.low_stock_threshold
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {formatPrice((p.cost_price || p.price) * p.stock_quantity)}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{p.low_stock_threshold} units</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setQuantityChange(10);
                        setChangeType('restock');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History Audit Log */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h2 className="font-brand font-bold text-lg text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-pink-600" />
          <span>Recent Inventory Movement Logs</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-3">Change</th>
                <th className="py-3 px-3">Prev → New</th>
                <th className="py-3 px-3">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No inventory movements recorded yet. Movements are logged when stock is updated or orders are processed.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{m.product_name}</td>
                    <td className="py-3 px-3">
                      <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {m.change_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <span className={m.quantity_change > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {m.previous_stock} → {m.new_stock}
                    </td>
                    <td className="py-3 px-3 text-slate-500 italic">{m.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
              <h3 className="font-brand font-bold text-lg text-slate-900">
                Adjust Stock for {selectedProduct.name}
              </h3>
              <p className="text-xs text-slate-500">
                Current warehouse stock: <strong>{selectedProduct.stock_quantity} units</strong>
              </p>

              <form onSubmit={handleAdjustStock} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Adjustment Type</label>
                  <select
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="restock">Restock / New Shipment (+)</option>
                    <option value="manual_adjustment">Manual Adjustment</option>
                    <option value="order_cancelled">Restock from Cancelled Order (+)</option>
                    <option value="return">Customer Return (+)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quantity Change</label>
                  <input
                    type="number"
                    required
                    value={quantityChange}
                    onChange={(e) => setQuantityChange(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    placeholder="e.g. 15"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Reason / Notes *</label>
                  <textarea
                    required
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="Received cargo container batch #881..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                  >
                    {submitting ? 'Applying...' : 'Save Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
