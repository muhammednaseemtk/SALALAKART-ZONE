import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StoreSettings } from '../../types';
import { Save, CheckCircle } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api.getStoreSettings();
      setSettings(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleChange = (field: keyof StoreSettings, val: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: val });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    await api.updateStoreSettings(settings);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading && !settings) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Configuration
          </span>
          <h1 className="font-brand font-black text-2xl sm:text-3xl text-slate-900 mt-1">
            Store Settings & Policies
          </h1>
          <p className="text-xs text-slate-500">
            Control branding and payment methods
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>Store settings saved and updated across the live storefront!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Brand Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="font-brand font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            Store Information & Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Store Name</label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Brand Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Support Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Support Phone & WhatsApp</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Physical Store Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways Config */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="font-brand font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            Payment Gateways
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_cod_enabled}
                onChange={(e) => handleChange('is_cod_enabled', e.target.checked)}
                className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Cash on Delivery (COD)</span>
                <span className="text-slate-500">Allow customers to pay physical cash upon package handover</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_upi_enabled}
                onChange={(e) => handleChange('is_upi_enabled', e.target.checked)}
                className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">UPI & Direct Bank Transfer</span>
                <span className="text-slate-500">Allow mobile instant UPI QR payments</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
