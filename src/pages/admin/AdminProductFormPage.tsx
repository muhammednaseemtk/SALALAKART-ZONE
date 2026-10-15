import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Product, Category, ProductVariant, ProductImage } from '../../types';
import { uploadProductImage } from '../../lib/supabase';
import {
  Package,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Layers,
  Upload,
  Loader2,
} from 'lucide-react';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    short_description: '',
    description: '',
    category_id: '',
    price: 0,
    sale_price: '' as string | number,
    cost_price: 0,
    stock_quantity: 10,
    low_stock_threshold: 5,
    brand: 'SpeedMaster',
    barcode: '',
    weight: '0.5 kg',
    dimensions: '20 x 15 x 8 cm',
    is_featured: false,
    is_active: true,
  });

  const [images, setImages] = useState<ProductImage[]>([
    {
      id: 'img-1',
      image_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      display_order: 1,
      is_primary: true,
    },
  ]);

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    async function init() {
      const cats = await api.getCategories();
      setCategories(cats);

      if (cats.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: cats[0].id }));
      }

      if (id) {
        setLoading(true);
        const existing = await api.getProductById(id);
        if (existing) {
          setFormData({
            name: existing.name,
            sku: existing.sku,
            slug: existing.slug,
            short_description: existing.short_description || '',
            description: existing.description,
            category_id: existing.category_id,
            price: existing.price,
            sale_price: existing.sale_price !== null && existing.sale_price !== undefined ? existing.sale_price : '',
            cost_price: existing.cost_price || 0,
            stock_quantity: existing.stock_quantity,
            low_stock_threshold: existing.low_stock_threshold || 5,
            brand: existing.brand || 'SpeedMaster',
            barcode: existing.barcode || '',
            weight: existing.weight || '',
            dimensions: existing.dimensions || '',
            is_featured: existing.is_featured,
            is_active: existing.is_active,
          });
          if (existing.images && existing.images.length > 0) {
            setImages(existing.images);
          }
          if (existing.variants) {
            setVariants(existing.variants);
          }
        }
        setLoading(false);
      }
    }
    init();
  }, [id]);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const skuPrefix = name.slice(0, 3).toUpperCase();
    const autoSku = formData.sku || `SKU-${skuPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    setFormData((prev) => ({
      ...prev,
      name,
      slug: !isEditing ? slug : prev.slug,
      sku: !isEditing ? autoSku : prev.sku,
    }));
  };

  const handleAddImage = () => {
    setImages((prev) => [
      ...prev,
      {
        id: `img-${Date.now()}`,
        image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
        display_order: prev.length + 1,
        is_primary: prev.length === 0,
      },
    ]);
  };

  const handleRemoveImage = (imgId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imgId));
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}`,
        name: 'Color',
        variant_type: 'color',
        value: 'Standard',
        sku: `${formData.sku}-V${prev.length + 1}`,
        price_adjustment: 0,
        stock_quantity: 10,
      },
    ]);
  };

  const handleRemoveVariant = (varId: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== varId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numPrice = Number(formData.price);
    const numSalePrice = formData.sale_price !== '' && formData.sale_price !== null && formData.sale_price !== undefined ? Number(formData.sale_price) : null;
    const numCostPrice = Number(formData.cost_price || 0);

    if (numPrice < 0 || (numSalePrice !== null && numSalePrice < 0) || numCostPrice < 0) {
      alert('Prices cannot be negative. Please enter a valid amount.');
      return;
    }

    if (numSalePrice !== null && numSalePrice > numPrice) {
      alert('Sale price cannot exceed regular price.');
      return;
    }

    setLoading(true);

    const selectedCat = categories.find((c) => c.id === formData.category_id);

    const payload = {
      ...formData,
      sale_price: numSalePrice,
      price: numPrice,
      cost_price: numCostPrice,
      stock_quantity: Math.max(0, Number(formData.stock_quantity)),
      low_stock_threshold: Math.max(0, Number(formData.low_stock_threshold)),
      category_name: selectedCat?.name || 'Toys',
      category_slug: selectedCat?.slug || 'toys',
      images,
      variants,
    };

    if (isEditing && id) {
      await api.updateProduct(id, payload);
    } else {
      await api.createProduct(payload as any);
    }

    setLoading(false);
    setSuccessMsg(true);
    setTimeout(() => {
      navigate('/admin/products');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/products"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
        <span className="text-xs text-slate-400">
          {isEditing ? `Editing Product #${id}` : 'Creating New Catalog Item'}
        </span>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-brand font-black text-2xl sm:text-3xl text-slate-900">
            {isEditing ? 'Edit Product Details' : 'Add New Product'}
          </h1>
          <p className="text-xs text-slate-500">
            Fill in the pricing, images, inventory stock, and descriptions
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>Product saved successfully! Returning to catalog...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="font-brand font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                placeholder="e.g. ThunderSpeed 4WD Stunt RC Car"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">SKU (Unique Code) *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 font-mono bg-slate-50/50"
                placeholder="SKU-RC-001"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 font-mono bg-slate-50/50"
                placeholder="thunderspeed-4wd-stunt-rc-car"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Brand Name</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                placeholder="SpeedMaster"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Barcode / UPC (Optional)</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50 font-mono"
                placeholder="8901234567890"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Weight</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                placeholder="0.85 kg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Short Summary (Preview)</label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                placeholder="Brief one-line highlight shown on product cards"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Description & Story *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
                placeholder="Comprehensive description, features, materials, and safety guidelines..."
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock Management */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="font-brand font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Regular Price (₹) *</label>
              <div className="relative rounded-xl overflow-hidden">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Math.max(0, Number(e.target.value)) })}
                  className="w-full text-xs p-3 pl-7 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50 font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Sale Price (₹) (Optional)</label>
              <div className="relative rounded-xl overflow-hidden">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-500 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sale_price}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, sale_price: val === '' ? '' : Math.max(0, Number(val)) });
                  }}
                  className="w-full text-xs p-3 pl-7 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50 font-bold text-pink-600"
                  placeholder="Discounted price"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-purple-700 block mb-1">Purchase Cost (₹) (Admin Only)</label>
              <div className="relative rounded-xl overflow-hidden">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-500 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: Math.max(0, Number(e.target.value)) })}
                  className="w-full text-xs p-3 pl-7 rounded-xl border border-purple-200 focus:outline-purple-500 bg-purple-50/30 font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Low-Stock Alert Threshold *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: Number(e.target.value) })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-pink-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                />
                <span>Active on Store</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>Featured Product</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Images (Supabase / Unsplash / Custom URL) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-brand font-bold text-base text-slate-900">Product Images</h2>
              <p className="text-[11px] text-slate-500">Provide direct image URLs or Supabase Storage links</p>
            </div>
            <button
              type="button"
              onClick={handleAddImage}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image</span>
            </button>
          </div>

          <div className="space-y-3">
            {images.map((img, idx) => (
              <div key={img.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <img
                  src={img.image_url}
                  alt=""
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                />
                <input
                  type="text"
                  required
                  value={img.image_url}
                  onChange={(e) => {
                    const next = [...images];
                    next[idx].image_url = e.target.value;
                    setImages(next);
                  }}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-white w-full"
                  placeholder="https://... or click Upload File"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <label className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    {uploadingIndex === idx ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    ) : (
                      <Upload className="w-4 h-4 text-purple-600" />
                    )}
                    <span>{uploadingIndex === idx ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingIndex === idx}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingIndex(idx);
                        const { url, error } = await uploadProductImage(file);
                        setUploadingIndex(null);
                        if (url) {
                          const next = [...images];
                          next[idx].image_url = url;
                          setImages(next);
                        } else if (error) {
                          alert(`Image upload failed: ${error}`);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    disabled={images.length === 1}
                    className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
