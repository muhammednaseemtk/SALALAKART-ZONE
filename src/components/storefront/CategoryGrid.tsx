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
  // Brand-aligned card accents using the brand colour palette
  const accentGradients = [
    'from-[#033d2f]/10 to-[#8fe40f]/20 text-[#033d2f] dark:text-[#8fe40f] border-[#033d2f]/20 dark:border-[#8fe40f]/30',
    'from-[#8fe40f]/15 to-[#033d2f]/10 text-[#033d2f] dark:text-[#8fe40f] border-[#8fe40f]/30 dark:border-[#8fe40f]/30',
    'from-[#033d2f]/15 to-[#033d2f]/5 text-[#033d2f] dark:text-[#ffffff] border-[#033d2f]/20 dark:border-[#8fe40f]/20',
    'from-[#8fe40f]/20 to-[#8fe40f]/5 text-[#033d2f] dark:text-[#8fe40f] border-[#8fe40f]/40 dark:border-[#8fe40f]/40',
    'from-[#033d2f]/10 to-[#8fe40f]/15 text-[#033d2f] dark:text-[#8fe40f] border-[#033d2f]/20 dark:border-[#8fe40f]/30',
    'from-[#8fe40f]/10 to-[#033d2f]/20 text-[#033d2f] dark:text-[#ffffff] border-[#8fe40f]/30 dark:border-[#8fe40f]/30',
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
          <span>{categories.length > 0 ? `View All ${categories.length} Categories` : 'View All Categories'}</span>
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
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden mb-2.5 shadow-sm border-2 border-white dark:border-white/20 bg-white dark:bg-black">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-[#8fe40f] transition-colors">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium mt-0.5">Explore →</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
