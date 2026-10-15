import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, ShoppingCart, Star, Eye, Check } from 'lucide-react';
import { formatPrice } from '../../utils/currency';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images[0]?.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images[1]?.image_url || primaryImage;

  const currentPrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price;
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.sale_price!) / product.price) * 100) : 0;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const res = addItem(product, 1);
    if (res.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1800);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white rounded-3xl p-3 border border-slate-100 hover:border-pink-200 shadow-xs hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Area */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 mb-3.5">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {product.images.length > 1 && (
            <img
              src={secondaryImage}
              alt={`${product.name} preview`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-extrabold text-[10px] shadow-sm tracking-wide">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_featured && !hasDiscount && (
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-extrabold text-[10px] shadow-sm tracking-wide">
              FEATURED
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white font-bold text-[10px] shadow-sm">
              SOLD OUT
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold text-[10px] shadow-sm animate-pulse">
              Only {product.stock_quantity} left
            </span>
          ) : null}
        </div>

        {/* Action Buttons: Wishlist & Quick View */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleToggleWishlist}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md ${
              inWishlist
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
            }`}
            title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-pink-600 flex items-center justify-center transition-all shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100"
              title="Quick preview"
              aria-label="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-semibold text-pink-600 tracking-wide uppercase">
              {product.category_name || 'Toys & Gadgets'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({product.review_count})</span>
            </div>
          </div>

          {/* Product Name */}
          <Link
            to={`/product/${product.slug}`}
            className="block font-semibold text-sm text-slate-800 hover:text-pink-600 transition-colors line-clamp-2 leading-snug mb-2 font-sans"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-slate-50 flex items-center justify-between gap-1.5 mt-auto">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-1">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-1.5 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-95 hover:shadow-pink-500/25'
            }`}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            aria-label="Add to cart"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
