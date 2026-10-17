import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCatalogRealtime } from '../hooks/useCatalogRealtime';
import { Product, Category, Banner, Review } from '../types';
import { HeroBanner } from '../components/storefront/HeroBanner';
import { CategoryGrid } from '../components/storefront/CategoryGrid';
import { ProductCard } from '../components/storefront/ProductCard';
import { QuickViewModal } from '../components/storefront/QuickViewModal';
import {
  Watch,
  ArrowRight,
  Star,
  Quote,
  CheckCircle2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [watchGadgetProducts, setWatchGadgetProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [, setLoading] = useState(true);

  const loadData = useCallback(async () => {
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
      setWatchGadgetProducts(
        prodList.filter((p) => p.category_slug === 'watches' || p.category_slug === 'smart-gadgets' || p.category_slug === 'electronic-gadgets')
      );
      setReviews(revList);
    } catch (err) {
      console.error('Error loading homepage data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize in real time with Supabase changes
  useCatalogRealtime(loadData);

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

      {/* 7. Customer Reviews & Community Feedback (only shown if reviews exist) */}
      {reviews.length > 0 && (
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
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
