import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import {
  SlidersHorizontal,
  X,
  Search,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';
import { formatPrice } from '../utils/currency';

const DEFAULT_MAX_PRICE = 25000;

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const filterParam = searchParams.get('filter') || '';
  const searchParam = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(DEFAULT_MAX_PRICE);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'latest' | 'rating'>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts({
          categorySlug: selectedCategory || undefined,
          search: searchParam || undefined,
          sort: sortBy,
        }),
      ]);
      setCategories(cats);

      let filtered = prods;
      if (filterParam === 'offers') {
        filtered = filtered.filter((p) => p.sale_price !== null && p.sale_price !== undefined && p.sale_price < p.price);
      }
      if (selectedBrand) {
        filtered = filtered.filter((p) => p.brand === selectedBrand);
      }
      if (inStockOnly) {
        filtered = filtered.filter((p) => p.stock_quantity > 0);
      }
      filtered = filtered.filter((p) => (p.sale_price || p.price) <= priceRange);

      setProducts(filtered);
      setLoading(false);
    }
    load();
  }, [selectedCategory, selectedBrand, inStockOnly, priceRange, sortBy, searchParam, filterParam]);

  // Unique brands
  const brands = Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange(DEFAULT_MAX_PRICE);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedBrand || priceRange < DEFAULT_MAX_PRICE || inStockOnly || filterParam || searchParam
  );

  // Filter content component reused between desktop sidebar and mobile drawer
  const FilterControls = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-800">
          <span>Max Price</span>
          <span className="text-pink-600 font-extrabold">{formatPrice(priceRange)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={DEFAULT_MAX_PRICE}
          step="100"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-pink-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
        />
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>{formatPrice(0)}</span>
          <span>{formatPrice(10000)}</span>
          <span>{formatPrice(DEFAULT_MAX_PRICE)}+</span>
        </div>
      </div>

      {/* Stock availability */}
      <div className="pt-2">
        <label className="flex items-center gap-3 text-xs font-bold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider text-[11px]">Brands</label>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedBrand('')}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                !selectedBrand ? 'bg-pink-50 text-pink-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Brands</span>
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b === selectedBrand ? '' : b)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                  selectedBrand === b ? 'bg-pink-50 text-pink-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{b}</span>
                {selectedBrand === b && <Check className="w-3.5 h-3.5 text-pink-600" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Checklist */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider text-[11px]">Categories</label>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                const next = c.slug === selectedCategory ? '' : c.slug;
                setSelectedCategory(next);
                if (next) setSearchParams({ category: next });
                else setSearchParams({});
              }}
              className={`w-full text-left text-xs px-2.5 py-2 rounded-xl transition-colors flex items-center justify-between ${
                selectedCategory === c.slug
                  ? 'bg-pink-50 text-pink-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{c.name}</span>
              {selectedCategory === c.slug && <Check className="w-3.5 h-3.5 text-pink-600 shrink-0 ml-1" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen">
      {/* Page Heading & Breadcrumb */}
      <div className="mb-6">
        <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Complete Store Catalog
        </span>
        <h1 className="font-brand font-black text-2xl sm:text-3xl md:text-4xl text-slate-900 mt-2 leading-tight">
          {searchParam
            ? `Search: "${searchParam}"`
            : selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || 'Products'
            : filterParam === 'offers'
            ? 'Discounted Deals & Clearance'
            : 'Explore Toys, Gifts, Watches & Gadgets'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Showing <span className="font-bold text-slate-800">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Top Filter Bar & Sorting */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs mb-6 sm:mb-8 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Category quick pills - touch scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs -mx-1 px-1">
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchParams({});
            }}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors shrink-0 ${
              !selectedCategory
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setSearchParams({ category: cat.slug });
              }}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat.slug
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Mobile controls & Desktop Sorting */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-xs font-bold text-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-500" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs ml-auto">
            <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-800 text-xs focus:outline-pink-500 cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="latest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Desktop Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-pink-600" />
              <span>Filters</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <FilterControls />
        </aside>

        {/* Mobile Slide-over Filter Sheet */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileFilterOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
              <div className="w-screen max-w-full sm:max-w-sm bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-pink-600" />
                    <h3 className="font-brand font-bold text-base text-slate-900">
                      Filter Products
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                  <FilterControls />
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-2 gap-2 shadow-lg">
                  <button
                    onClick={clearAllFilters}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="py-2.5 px-4 rounded-xl bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-500/20"
                  >
                    Show ({products.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-3xl p-3 sm:p-4 border border-slate-100">
                  <div className="aspect-square bg-slate-100 rounded-2xl mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-brand font-bold text-xl text-slate-800 mb-1">
                No matching products found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                Try adjusting your price range, clearing filters, or searching for other toys, watches or gadgets.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs hover:opacity-95 shadow-md shadow-pink-500/20"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
