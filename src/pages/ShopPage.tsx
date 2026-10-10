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
  ChevronDown,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

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
  const [priceRange, setPriceRange] = useState<number>(100);
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
    setPriceRange(100);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedBrand || priceRange < 100 || inStockOnly || filterParam || searchParam
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Page Heading & Breadcrumb */}
      <div className="mb-6">
        <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Complete Store Catalog
        </span>
        <h1 className="font-brand font-black text-3xl sm:text-4xl text-slate-900 mt-2">
          {searchParam
            ? `Search Results for "${searchParam}"`
            : selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || 'Products'
            : filterParam === 'offers'
            ? 'Special Offers & Clearance Deals'
            : 'Explore All Toys, Gifts, Watches & Gadgets'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Showing {products.length} {products.length === 1 ? 'item' : 'items'} available for delivery
        </p>
      </div>

      {/* Top Filter Bar & Sorting */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
        {/* Category quick pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-2xl scrollbar-none text-xs">
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchParams({});
            }}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
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
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-500" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 text-xs focus:outline-pink-500"
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

      {/* Main Layout: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`md:block ${
            isMobileFilterOpen ? 'block' : 'hidden'
          } bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-pink-600" />
              <span>Filters</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-500 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Max Price</span>
              <span className="text-pink-600">${priceRange}</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-pink-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$10</span>
              <span>$150+</span>
            </div>
          </div>

          {/* Stock availability */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
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
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-900 block">Brands</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedBrand('')}
                  className={`w-full text-left text-xs px-2 py-1 rounded-lg transition-colors flex items-center justify-between ${
                    !selectedBrand ? 'bg-pink-50 text-pink-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Brands</span>
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b === selectedBrand ? '' : b)}
                    className={`w-full text-left text-xs px-2 py-1 rounded-lg transition-colors flex items-center justify-between ${
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
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Categories</label>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    const next = c.slug === selectedCategory ? '' : c.slug;
                    setSelectedCategory(next);
                    if (next) setSearchParams({ category: next });
                    else setSearchParams({});
                  }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                    selectedCategory === c.slug
                      ? 'bg-pink-50 text-pink-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {selectedCategory === c.slug && <Check className="w-3.5 h-3.5 text-pink-600" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-3xl p-4 border border-slate-100">
                  <div className="aspect-square bg-slate-100 rounded-2xl mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
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
