import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, ProductVariant, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/storefront/ProductCard';
import {
  Star,
  Heart,
  ShoppingCart,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Share2,
  Package,
  MessageSquare,
  Send,
  AlertCircle,
} from 'lucide-react';
import { formatPrice } from '../utils/currency';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery' | 'reviews'>('desc');
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Review submission form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const prod = await api.getProductBySlug(slug);
      if (prod) {
        setProduct(prod);
        setSelectedImage(prod.images[0]?.image_url || '');
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        } else {
          setSelectedVariant(undefined);
        }

        // Related products in same category
        const allProds = await api.getProducts({ categorySlug: prod.category_slug });
        setRelatedProducts(allProds.filter((p) => p.id !== prod.id).slice(0, 4));

        // Reviews
        const revs = await api.getReviews(prod.id);
        setReviews(revs);
      }
      setLoading(false);
    }
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The item you are looking for may have been moved or removed.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-sm hover:bg-pink-700"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const unitPrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price;
  const finalPrice = unitPrice + (selectedVariant?.price_adjustment || 0);
  const availableStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= product.low_stock_threshold;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addItem(product, quantity, selectedVariant);
    if (res.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity, selectedVariant);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    setSubmittingReview(true);
    await api.submitReview({
      product_id: product.id,
      product_name: product.name,
      user_id: user?.id || 'guest',
      customer_name: user?.full_name || 'Verified Customer',
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      is_verified_purchase: true,
    });

    const updatedRevs = await api.getReviews(product.id);
    setReviews(updatedRevs);
    setSubmittingReview(false);
    setReviewSuccess(true);
    setReviewTitle('');
    setReviewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen pb-32 md:pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 mb-5 overflow-hidden">
        <Link to="/" className="hover:text-pink-600 shrink-0">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-pink-600 shrink-0">Shop</Link>
        <span>/</span>
        {product.category_slug && (
          <>
            <Link to={`/category/${product.category_slug}`} className="hover:text-pink-600 truncate max-w-[90px] sm:max-w-none">
              {product.category_name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-700 font-medium truncate max-w-[110px] sm:max-w-[220px]">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-16">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-sm relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.sale_price && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow-md">
                SALE
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img.image_url
                      ? 'border-pink-500 ring-2 ring-pink-500/20 scale-95'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                {product.brand} • {product.category_name}
              </span>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                title="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="font-brand font-black text-2xl sm:text-4xl text-slate-900 mt-3 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex items-center gap-3 mt-3 text-xs">
              <div className="flex items-center text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-400">•</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-pink-600 hover:underline font-semibold"
              >
                {product.review_count} Customer Reviews
              </button>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-mono">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 flex items-baseline gap-3">
            <span className="font-extrabold text-3xl sm:text-4xl text-slate-900">
              {formatPrice(finalPrice)}
            </span>
            {product.sale_price && (
              <span className="text-lg text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            {product.sale_price && (
              <span className="text-xs font-bold text-rose-600 bg-rose-100/70 px-2.5 py-1 rounded-full">
                Save {formatPrice(product.price - product.sale_price)} (
                {Math.round(((product.price - product.sale_price) / product.price) * 100)}% Off)
              </span>
            )}
          </div>

          {/* Short description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.short_description}
          </p>

          {/* Variants selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-800 block">
                Choose {product.variants[0].name}:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-600/20'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{v.value}</span>
                    {v.price_adjustment > 0 && (
                      <span className="text-[10px] text-slate-400 ml-1">
                        (+{formatPrice(v.price_adjustment)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock availability */}
          <div className="text-xs">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                <AlertCircle className="w-4 h-4" /> Currently Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg animate-pulse">
                <AlertCircle className="w-4 h-4" /> Only {availableStock} items left in stock!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                In Stock & Ready for Rapid Dispatch
              </span>
            )}
          </div>

          {/* Quantity and Primary Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity stepper */}
              <div className="flex items-center border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-3 text-slate-600 hover:bg-slate-200 text-sm font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  className="px-3.5 py-3 text-slate-600 hover:bg-slate-200 text-sm font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-95 shadow-pink-500/25 hover:scale-[1.01]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart ({formatPrice(finalPrice * quantity)})</span>
                  </>
                )}
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-2xl border transition-colors ${
                  inWishlist
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:border-pink-300'
                }`}
                title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-md"
            >
              Buy Now with 1-Click Checkout
            </button>
          </div>

          {/* Quick Perks Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <Truck className="w-5 h-5 text-pink-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">Free Delivery</p>
              <p className="text-[10px] text-slate-500">On orders over ₹75</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">100% Genuine</p>
              <p className="text-[10px] text-slate-500">Brand certified toys</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <RotateCcw className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">Easy Returns</p>
              <p className="text-[10px] text-slate-500">7-day exchange</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications, Delivery, Reviews */}
      <div className="my-14 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 gap-6 text-sm font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Description & Features
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'delivery'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Delivery & Returns
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="pt-6">
          {activeTab === 'desc' && (
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-xl">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 font-bold text-slate-500 w-1/3">Brand</td>
                    <td className="py-2.5 text-slate-800 font-semibold">{product.brand}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-500">Product SKU</td>
                    <td className="py-2.5 text-slate-800 font-mono">{product.sku}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-500">Weight</td>
                    <td className="py-2.5 text-slate-800">{product.weight || '0.5 kg'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-500">Dimensions</td>
                    <td className="py-2.5 text-slate-800">{product.dimensions || 'Standard retail package'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-500">Category</td>
                    <td className="py-2.5 text-slate-800">{product.category_name}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-4 text-xs text-slate-600 max-w-2xl leading-relaxed">
              <p className="font-semibold text-slate-800 text-sm">🚚 Fast Countrywide Dispatch</p>
              <p>
                We process and dispatch all confirmed orders within 24 business hours from our Salalah store.
                Delivery within Dhofar region typically takes 1-2 days, and other regions within 2-4 days.
              </p>
              <p className="font-semibold text-slate-800 text-sm">💵 Payment Flexibility</p>
              <p>
                Pay conveniently with Cash on Delivery (COD), direct UPI, Debit/Credit Cards, or Bank Transfer.
              </p>
              <p className="font-semibold text-slate-800 text-sm">🔄 Hassle-Free Exchange Policy</p>
              <p>
                Products can be exchanged within 7 days of delivery in their original packaging and unused condition.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Write a review form */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-2xl">
                <h4 className="font-bold text-sm text-slate-900 mb-1">Share Your Experience</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Help fellow parents and shoppers know what makes this product special.
                </p>

                {reviewSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    Thank you! Your verified review has been posted successfully.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Your Rating</label>
                      <div className="flex gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star
                              className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-slate-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Headline</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kids love the glowing lights!"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-pink-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Review Comments</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Tell us about the build quality, battery life, or enjoyment..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-pink-500 bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-700 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No reviews yet. Be the first to review this product!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 mb-1">{rev.title}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">By {rev.customer_name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="my-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
                You May Also Like
              </span>
              <h3 className="font-brand font-black text-2xl text-slate-900 mt-1">Related Products</h3>
            </div>
            <Link to="/shop" className="text-xs font-bold text-pink-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Purchase Bar (only visible on mobile devices < md) */}
      <div className="fixed bottom-14 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-lg text-slate-900 leading-none">
              {formatPrice(finalPrice)}
            </span>
            {product.sale_price && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isOutOfStock ? 'Out of Stock' : 'In Stock & Ready'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleWishlist(product)}
            className={`p-2.5 rounded-xl border transition-colors ${
              inWishlist
                ? 'border-rose-200 bg-rose-50 text-rose-600'
                : 'border-slate-200 text-slate-600'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
