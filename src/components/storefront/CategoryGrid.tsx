import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';
import { ArrowRight } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  title?: string;
  subtitle?: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  title = 'Shop by Category',
  subtitle = 'Find the perfect toys, tech gadgets and gifts for every occasion',
}) => {
  // Vibrant colorful card accents inspired by the brand logo
  const accentGradients = [
    'from-pink-500/10 to-rose-500/20 text-pink-700 border-pink-200/60',
    'from-purple-500/10 to-indigo-500/20 text-purple-700 border-purple-200/60',
    'from-cyan-500/10 to-sky-500/20 text-cyan-700 border-cyan-200/60',
    'from-amber-500/10 to-yellow-500/20 text-amber-800 border-amber-200/60',
    'from-orange-500/10 to-red-500/20 text-orange-700 border-orange-200/60',
    'from-emerald-500/10 to-teal-500/20 text-emerald-700 border-emerald-200/60',
  ];

  return (
    <section className="my-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
            Explore Collections
          </span>
          <h2 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-2">
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
        <Link
          to="/shop"
          className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 group whitespace-nowrap"
        >
          <span>View All 15 Categories</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat, idx) => {
          const accent = accentGradients[idx % accentGradients.length];

          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className={`group flex flex-col items-center p-3 rounded-2xl bg-gradient-to-b ${accent} border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center`}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden mb-2.5 shadow-sm border-2 border-white bg-white">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:text-pink-600 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">Explore →</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
