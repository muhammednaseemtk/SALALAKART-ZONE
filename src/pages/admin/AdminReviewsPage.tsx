import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Review } from '../../types';
import { Star, CheckCircle, XCircle, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReviews();
      setReviews(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load customer reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleApproval = async (rev: Review) => {
    await api.updateReviewStatus(rev.id, !rev.is_approved);
    loadReviews();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this review permanently?')) {
      await api.deleteReview(id);
      loadReviews();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            User Feedback
          </span>
          <h1 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-1">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-slate-500">
            Moderate ratings, testimonials and verified buyer feedback
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading reviews...</div>
        ) : error ? (
          <div className="py-16 text-center p-8">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-rose-700">Failed to load reviews</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
            <button
              onClick={loadReviews}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center p-8">
            <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No reviews found</p>
            <p className="text-xs text-slate-400 mt-1">Customer ratings and reviews will appear here as they are submitted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Review Content</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {rev.product_name || 'Product'}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{rev.customer_name}</p>
                      {rev.is_verified_purchase && (
                        <span className="text-[10px] text-emerald-600 font-bold">Verified Buyer</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-bold text-slate-900">{rev.title}</p>
                      <p className="text-slate-500 line-clamp-2">{rev.comment}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleApproval(rev)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer ${
                          rev.is_approved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rev.is_approved ? 'Approved' : 'Pending'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
