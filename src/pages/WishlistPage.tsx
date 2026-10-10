import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (prod: any) => {
    addItem(prod, 1);
    removeFromWishlist(prod.id);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h1 className="font-brand font-black text-3xl text-slate-900 mb-2">Your Wishlist is Empty</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Save your favorite toys, watches and tech gadgets here so you never lose track of them.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
        >
          Explore Catalog Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Saved Items
          </span>
          <h1 className="font-brand font-black text-3xl sm:text-4xl text-slate-900 mt-2">
            My Wishlist ({items.length})
          </h1>
        </div>
        <button
          onClick={clearWishlist}
          className="text-xs font-bold text-rose-500 hover:text-rose-700"
        >
          Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((prod) => {
          const currentPrice = prod.sale_price || prod.price;

          return (
            <div
              key={prod.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-pink-200 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-3">
                  <Link to={`/product/${prod.slug}`}>
                    <img
                      src={prod.images[0]?.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(prod.id)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-rose-500 hover:bg-white shadow-md transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 block mb-1">
                  {prod.brand} • {prod.category_name}
                </span>
                <Link
                  to={`/product/${prod.slug}`}
                  className="font-bold text-sm text-slate-900 hover:text-pink-600 transition-colors line-clamp-2"
                >
                  {prod.name}
                </Link>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-extrabold text-base text-slate-900">
                    ${currentPrice.toFixed(2)}
                  </span>
                  {prod.sale_price && (
                    <span className="text-xs text-slate-400 line-through">
                      ${prod.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => handleMoveToCart(prod)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
