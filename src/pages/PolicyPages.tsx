import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, FileText } from 'lucide-react';

export const PolicyPages: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Privacy Policy';
  let icon = <ShieldCheck className="w-6 h-6 text-pink-600" />;
  let content = null;

  if (path.includes('terms')) {
    title = 'Terms & Conditions';
    icon = <FileText className="w-6 h-6 text-purple-600" />;
    content = (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          Welcome to <strong>SALALAKART ZONE</strong>. By browsing, creating an account or placing an order through our website,
          you agree to adhere to and be bound by the following Terms and Conditions.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">1. Use of the Website</h3>
        <p>
          Users must be at least 18 years of age or possess legal parental/guardian consent to make online purchases.
          All content, including product photographs, brand typography, and descriptions, are the intellectual property of SALALAKART ZONE.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">2. Pricing and Availability</h3>
        <p>
          All prices are quoted in Indian Rupees (INR / ₹). We reserve the right to correct any typographical pricing errors.
          Stock levels are validated at the moment of checkout. In the rare event an item oversells, you will be notified and promptly refunded.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">3. Orders and Payment</h3>
        <p>
          When you place an order, you agree to pay the total amount specified, including applicable taxes and delivery charges.
          For Cash on Delivery (COD), payment must be handed over in full upon parcel receipt.
        </p>
      </div>
    );
  } else if (path.includes('shipping')) {
    title = 'Shipping & Delivery Policy';
    icon = <Truck className="w-6 h-6 text-cyan-600" />;
    content = (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          At <strong>SALALAKART ZONE</strong>, we prioritize the safe and prompt delivery of every toy, gift, watch, and electronic gadget.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">1. Dispatch Timelines</h3>
        <p>
          Orders confirmed before 2:00 PM are dispatched from our Salalah fulfillment hub the very same day.
          Orders placed after 2:00 PM or during public holidays will be dispatched on the next working day.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">2. Delivery Zones and Rates</h3>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li><strong>Standard Delivery (3-5 Days):</strong> ₹4.99 (or FREE on orders above ₹75.00).</li>
          <li><strong>Express Priority Air (1-2 Days):</strong> ₹9.99 for urgent gifting needs.</li>
          <li><strong>Same-Day Courier (Salalah Zone):</strong> ₹14.99 for local delivery within 6 hours.</li>
        </ul>
        <h3 className="font-bold text-base text-slate-900 pt-2">3. Tracking Your Parcel</h3>
        <p>
          You will receive an automated tracking notification as soon as your shipment is dispatched.
          You can also check the real-time fulfillment status directly from your Customer Account page.
        </p>
      </div>
    );
  } else if (path.includes('return')) {
    title = 'Returns, Refunds & Exchanges';
    icon = <RotateCcw className="w-6 h-6 text-amber-600" />;
    content = (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          Customer satisfaction and smiles are our highest priority! If you or your child are not completely delighted with your purchase,
          we offer a straightforward exchange and return policy.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">1. 7-Day Exchange Window</h3>
        <p>
          Items in unused condition, with original packaging, tags, and accessories intact, can be returned or exchanged within 7 days of delivery.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">2. Damaged or Defective Items</h3>
        <p>
          In the unlikely event that a toy or gadget arrives damaged or defective, please contact our support team on WhatsApp (+968 9123 4567)
          within 48 hours of receipt. We will dispatch a free replacement immediately.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">3. Refund Processing</h3>
        <p>
          Approved refunds will be processed to the original payment method or issued as store credit within 3 to 5 business days.
        </p>
      </div>
    );
  } else {
    // Privacy policy
    content = (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          At <strong>SALALAKART ZONE</strong>, we respect your personal privacy. This Privacy Policy details how we collect, protect,
          and utilize your customer data in full compliance with applicable privacy laws and Supabase Row Level Security (RLS) standards.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">1. Information We Collect</h3>
        <p>
          We collect your name, email address, telephone number, and delivery addresses strictly to facilitate order fulfillment,
          deliver shipment tracking alerts, and provide customer support.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">2. Multi-User Isolation & Security</h3>
        <p>
          We employ strict Row Level Security (RLS) at the database layer. Every customer account is strictly isolated, ensuring no other user
          can ever view your orders, addresses, or private details.
        </p>
        <h3 className="font-bold text-base text-slate-900 pt-2">3. Payment Security</h3>
        <p>
          We never store full debit or credit card details on our servers. All digital payments are encrypted and processed by authorized financial gateways.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-8">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
            {icon}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SALALAKART ZONE Policies
            </span>
            <h1 className="font-brand font-black text-2xl sm:text-3xl text-slate-900">
              {title}
            </h1>
          </div>
        </div>

        {content}

        {/* Quick Links between policies */}
        <div className="pt-8 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-bold text-pink-600">
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms-and-conditions" className="hover:underline">Terms & Conditions</Link>
          <span>•</span>
          <Link to="/shipping-policy" className="hover:underline">Shipping Policy</Link>
          <span>•</span>
          <Link to="/return-policy" className="hover:underline">Return & Refund Policy</Link>
        </div>
      </div>
    </div>
  );
};
