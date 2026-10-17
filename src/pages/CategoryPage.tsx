import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCatalogRealtime } from '../hooks/useCatalogRealtime';
import { Product, Category } from '../types';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { ArrowLeft, Sparkles, SlidersHorizontal } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const [cat, prods] = await Promise.all([
      api.getCategoryBySlug(slug),
      api.getProducts({ categorySlug: slug, sort: sortBy }),
    ]);
    setCategory(cat);
    setProducts(prods);
    setLoading(false);
  }, [slug, sortBy]);

  useEffect(() => {
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [load]);

  // Real-time synchronization
  useCatalogRealtime(load);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 text-white p-8 sm:p-12 mb-10 shadow-lg">
        <div className="relative z-10 max-w-xl space-y-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold text-pink-200 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>
          <h1 className="font-brand font-black text-3xl sm:text-5xl leading-tight">
            {category?.name || 'Category'}
          </h1>
          <p className="text-xs sm:text-sm text-pink-100 leading-relaxed">
            {category?.description ||
              'Explore handpicked premium toys, gifts and electronics curated for maximum fun and learning.'}
          </p>
        </div>
        {category?.image_url && (
          <img
            src={category.image_url}
            alt=""
            className="absolute right-0 top-0 bottom-0 w-1/2 object-cover mix-blend-overlay opacity-30 pointer-events-none hidden md:block"
          />
        )}
      </div>

      {/* Bar with Sort & Counts */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <p className="text-xs font-bold text-slate-500">
          Showing {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-pink-500"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-3xl p-4 border border-slate-100">
              <div className="aspect-square bg-slate-100 rounded-2xl mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
          <h3 className="font-bold text-base text-slate-800">No products in this category yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">Check back soon as new inventory arrives every week!</p>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs"
          >
            Browse Other Categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
