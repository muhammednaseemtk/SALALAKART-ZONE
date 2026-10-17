import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Banner } from '../../types';
import { Image, Plus, Edit, Trash2, CheckCircle, X, AlertCircle, Loader2 } from 'lucide-react';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [linkUrl, setLinkUrl] = useState('/shop');
  const [badgeText, setBadgeText] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const loadBanners = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await api.getBanners(true);
      setBanners(data);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load banners');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormError(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setButtonText('Shop Now');
    setLinkUrl('/shop');
    setBadgeText('');
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setFormError(null);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImageUrl(b.image_url);
    setButtonText(b.button_text || 'Shop Now');
    setLinkUrl(b.link_url || '/shop');
    setBadgeText(b.badge_text || '');
    setDisplayOrder(b.display_order ?? 1);
    setIsActive(b.is_active);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!title.trim()) {
      setFormError('Headline title is required.');
      return;
    }

    if (!imageUrl.trim()) {
      setFormError('Banner image URL is required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      image_url: imageUrl.trim(),
      button_text: buttonText.trim() || 'Shop Now',
      link_url: linkUrl.trim() || '/shop',
      badge_text: badgeText.trim() || undefined,
      display_order: Number(displayOrder) || 1,
      is_active: isActive,
    };

    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, payload);
        setSuccessFeedback('Banner updated successfully!');
      } else {
        await api.createBanner(payload);
        setSuccessFeedback('Banner created successfully!');
      }

      setModalOpen(false);
      setTimeout(() => setSuccessFeedback(null), 4000);
      await loadBanners();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database operation failed while saving banner.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete banner "${title}"?`)) {
      try {
        await api.deleteBanner(id);
        setSuccessFeedback('Banner deleted successfully.');
        setTimeout(() => setSuccessFeedback(null), 4000);
        await loadBanners();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete banner.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Storefront Presentation
          </span>
          <h1 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-1">
            Homepage Banners & Hero Ads
          </h1>
          <p className="text-xs text-slate-500">
            Control the hero banners displayed on the customer landing page
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-500/20 hover:opacity-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {successFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successFeedback}</span>
          </div>
          <button
            onClick={() => setSuccessFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          Loading banners...
        </div>
      ) : fetchError ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-rose-700">Failed to load banners</p>
          <p className="text-xs text-slate-500 mt-1">{fetchError}</p>
          <button
            onClick={loadBanners}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : banners.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8">
          <Image className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No banners found</p>
          <p className="text-xs text-slate-400 mt-1">Create promotional banners to showcase on your storefront homepage.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full bg-slate-900">
                  {b.image_url ? (
                    <img src={b.image_url} alt="" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800">
                      <Image className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                    Order #{b.display_order}
                  </span>
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      b.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {b.is_active ? 'Live' : 'Hidden'}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  {b.badge_text && (
                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">
                      {b.badge_text}
                    </span>
                  )}
                  <h3 className="font-brand font-bold text-base text-slate-900">{b.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{b.subtitle}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Link: {b.link_url}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(b)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id, b.title)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-brand font-bold text-lg text-slate-900">
                  {editingBanner ? 'Edit Banner' : 'Create Homepage Banner'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <div>
                      <p className="font-bold">Error saving banner</p>
                      <p className="mt-0.5 text-rose-600">{formError}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Headline Title *</label>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:outline-pink-500 disabled:opacity-60"
                    placeholder="e.g. Super Fun Toys & Cool Gadgets!"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle Description</label>
                  <textarea
                    rows={2}
                    disabled={submitting}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-pink-500 disabled:opacity-60"
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Banner Image URL *</label>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:bg-white focus:outline-pink-500 disabled:opacity-60"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Button Text</label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:outline-pink-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Destination Link</label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:bg-white focus:outline-pink-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Top Badge Pill</label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="e.g. Up to 40% Off"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-pink-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Display Order</label>
                    <input
                      type="number"
                      disabled={submitting}
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:outline-pink-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="ban_active"
                    disabled={submitting}
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4 cursor-pointer disabled:opacity-60"
                  />
                  <label htmlFor="ban_active" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Banner is Active and Shown on Homepage
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold hover:bg-pink-700 flex items-center gap-1.5 disabled:opacity-75 cursor-pointer shadow-sm shadow-pink-500/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingBanner ? 'Save Changes' : 'Create Banner'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
