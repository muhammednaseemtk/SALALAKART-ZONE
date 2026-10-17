import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCatalogRealtime } from '../hooks/useCatalogRealtime';
import { Product } from '../types';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import { Search, ArrowLeft } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [searchInput, setSearchInput] = useState(query);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const search = useCallback(async () => {
    setLoading(true);
    const res = await api.getProducts({ search: query });
    setProducts(res);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    search();
  }, [search]);

  // Real-time synchronization
  useCatalogRealtime(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="max-w-xl mx-auto text-center mb-8 space-y-3">
        <h1 className="font-brand font-black text-3xl text-slate-900">
          Search Products
        </h1>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search RC cars, smart watches, teddy bears..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full text-xs p-3.5 pl-11 pr-24 rounded-full border border-slate-200 focus:outline-pink-500 bg-white shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-pink-600 text-white font-bold text-xs hover:bg-pink-700 transition-colors"
          >
            Search
          </button>
        </form>
        {query && (
          <p className="text-xs text-slate-500">
            Found {products.length} {products.length === 1 ? 'match' : 'matches'} for "{query}"
          </p>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Searching inventory...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 max-w-lg mx-auto">
          <h3 className="font-bold text-base text-slate-800">No results found for "{query}"</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Try checking spelling or browsing our full category list.
          </p>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs"
          >
            Explore All Categories
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
