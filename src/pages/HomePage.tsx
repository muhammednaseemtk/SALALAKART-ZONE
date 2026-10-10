import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Category, Banner, Review } from '../types';
import { HeroBanner } from '../components/storefront/HeroBanner';
import { CategoryGrid } from '../components/storefront/CategoryGrid';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import {
  Sparkles,
  Flame,
  Watch,
  Gift,
  ArrowRight,
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [watchGadgetProducts, setWatchGadgetProducts] = useState<Product[]>([]);
  const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [banList, catList, prodList, revList] = await Promise.all([
          api.getBanners(),
          api.getCategories(),
          api.getProducts(),
          api.getReviews(),
        ]);

        setBanners(banList);
        setCategories(catList);
        setAllProducts(prodList);
        const featured = prodList.filter((p) => p.is_featured);
        // If featured products exist, use them; otherwise show all products so admin items always show!
        setFeaturedProducts(featured.length > 0 ? featured : prodList);
        setWatchGadgetProducts(
          prodList.filter((p) => p.category_slug === 'watches' || p.category_slug === 'smart-gadgets' || p.category_slug === 'electronic-gadgets')
        );
        setDiscountProducts(
          prodList.filter((p) => p.sale_price !== null && p.sale_price !== undefined && p.sale_price < p.price)
        );
        setReviews(revList);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen pb-16">
      {/* 1. Hero Promotional Banner Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroBanner banners={banners} />
      </div>

      {/* 2. Featured Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryGrid categories={categories.slice(0, 12)} />
      </div>

      {/* 3. Best-Selling & Trending Toys & Gifts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-pink-600 font-bold text-xs uppercase tracking-wider bg-pink-50 px-3 py-1 rounded-full w-fit">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-current" />
              <span>Trending & Most Loved</span>
            </div>
            <h2 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-2">
              Best-Selling Toys & Gifts
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top-rated RC cars, STEM sets and adorable plushes tested for pure joy
            </p>
          </div>
          <Link
            to="/shop?sort=featured"
            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 group whitespace-nowrap"
          >
            <span>Explore All Trending</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        {allProducts.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white border border-slate-200/80 p-8 max-w-xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-brand font-bold text-lg text-slate-800">Fresh Arrivals Coming Soon</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              We are updating our store shelves with new toys, watches, and smart gadgets!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
            >
              <span>Explore Categories</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 8).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Promotional Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-14">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 p-8 sm:p-12 text-white overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
              Special Weekend Deals
            </span>
            <h2 className="font-brand font-black text-3xl sm:text-4xl leading-tight">
              Instant 10% Discount with Code <span className="underline decoration-yellow-300">WELCOME10</span>
            </h2>
            <p className="text-sm text-pink-100 leading-relaxed">
              From birthdays to surprise celebrations, bring home smiles with premium gifts,
              watches and interactive toys. Free doorstep shipping on orders above $75!
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 font-extrabold text-sm hover:bg-yellow-300 transition-all shadow-lg"
              >
                <span>Shop Deals Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"
              alt="Promo toys"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5. Watches & Smart Gadgets Section (only shown if gadgets exist) */}
      {watchGadgetProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-cyan-600 font-bold text-xs uppercase tracking-wider bg-cyan-50 px-3 py-1 rounded-full w-fit">
                <Watch className="w-3.5 h-3.5 text-cyan-500" />
                <span>Smart Living & Tech</span>
              </div>
              <h2 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-2">
                Watches & Smart Gadgets
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Kids 4G GPS smart trackers, wireless chargers, karaoke mics & galaxy projectors
              </p>
            </div>
            <Link
              to="/category/watches"
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 group whitespace-nowrap"
            >
              <span>View All Gadgets</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {watchGadgetProducts.slice(0, 4).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Special Offers and Discounted Products */}
      {discountProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Price Drops & Bargains</span>
              </div>
              <h2 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-2">
                Special Offers & Clearances
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Save big on premium toys and gadgets while stocks last
              </p>
            </div>
            <Link
              to="/shop?filter=offers"
              className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 group"
            >
              <span>See All Offers</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {discountProducts.slice(0, 4).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. Customer Reviews & Community Feedback */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
            Real Customer Feedback
          </span>
          <h2 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-2">
            Loved by Parents & Kids in Salalah
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Over 2,500 happy families trust SALALAKART ZONE for gifts, gadgets and celebration surprises
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-pink-200" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">"{rev.title}"</h3>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{rev.customer_name}</h4>
                  <p className="text-[10px] text-slate-400">Review for: {rev.product_name}</p>
                </div>
                {rev.is_verified_purchase && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified Buyer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
