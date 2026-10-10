-- ==============================================================================
-- SALALAKART ZONE — INITIAL CATALOG SEED DATA SCRIPT
-- Run in Supabase SQL Editor to populate sample categories, shipping & coupons
-- ==============================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, display_order, is_active)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Toys', 'toys', 'Fun, active and imaginative play toys for kids of all ages', 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80', 1, true),
  ('a1000000-0000-0000-0000-000000000002', 'Educational Toys', 'educational-toys', 'STEM building kits, cognitive puzzles and brain boosting kits', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80', 2, true),
  ('a1000000-0000-0000-0000-000000000003', 'Baby Toys', 'baby-toys', 'Safe, soft, sensory, non-toxic baby rattles and developmental toys', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80', 3, true),
  ('a1000000-0000-0000-0000-000000000004', 'Remote-Control Cars', 'remote-control-cars', 'High-speed drift cars, 4WD monster trucks and stunt vehicles', 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80', 4, true),
  ('a1000000-0000-0000-0000-000000000005', 'Dolls & Action Figures', 'dolls-and-action-figures', 'Superhero figures, collectible anime models and fashion dolls', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80', 5, true),
  ('a1000000-0000-0000-0000-000000000006', 'Board Games & Puzzles', 'board-games-and-puzzles', 'Family strategy board games, jigsaw puzzles and chess sets', 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80', 6, true),
  ('a1000000-0000-0000-0000-000000000007', 'Gifts & Novelties', 'gifts', 'Heartwarming gifts, celebration hampers, novelty mugs and keepsakes', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80', 7, true),
  ('a1000000-0000-0000-0000-000000000008', 'Watches', 'watches', 'Kids colorful watches, digital chronographs and premium timepieces', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', 8, true),
  ('a1000000-0000-0000-0000-000000000009', 'Smart Gadgets', 'smart-gadgets', 'Smart watches for kids & teens, Bluetooth trackers and smart lamps', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80', 9, true),
  ('a1000000-0000-0000-0000-000000000010', 'Mobile Accessories', 'mobile-accessories', 'Fun pop-sockets, trendy phone cases, fast chargers and stands', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80', 10, true),
  ('a1000000-0000-0000-0000-000000000011', 'Electronic Gadgets', 'electronic-gadgets', 'Portable speakers, wireless karaoke mics and LED nightlights', 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=600&q=80', 11, true),
  ('a1000000-0000-0000-0000-000000000012', 'Kids Accessories', 'kids-accessories', 'Cute backpacks, water bottles, sunglasses and hairbands', 'https://images.unsplash.com/photo-1577741314755-048d8525d31e?auto=format&fit=crop&w=600&q=80', 12, true),
  ('a1000000-0000-0000-0000-000000000013', 'Stationery', 'stationery', 'Pastel gel pens, cute notebooks, art coloring sets and pencil cases', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80', 13, true),
  ('a1000000-0000-0000-0000-000000000014', 'Special Offers', 'special-offers', 'Huge discounts, clearance bargains and weekend bundle specials', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80', 14, true),
  ('a1000000-0000-0000-0000-000000000015', 'New Arrivals', 'new-arrivals', 'Fresh trending toys, watches, and smart lifestyle gadgets just landed', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80', 15, true)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED SHIPPING METHODS
INSERT INTO public.shipping_methods (id, name, description, price, estimated_days, is_active)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Standard Doorstep Delivery', 'Safe handling with SMS updates', 4.99, '3-5 Business Days', true),
  ('b1000000-0000-0000-0000-000000000002', 'Express Priority Courier', 'Air dispatch with real-time tracking', 9.99, '1-2 Business Days', true),
  ('b1000000-0000-0000-0000-000000000003', 'Super Speed Same-Day Delivery', 'Order before 2 PM for city zone delivery', 14.99, 'Today (Within 6 Hours)', true)
ON CONFLICT DO NOTHING;

-- 3. SEED COUPONS
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, start_date, end_date, usage_limit, per_customer_limit, is_active)
VALUES
  ('WELCOME10', 'percentage', 10.00, 25.00, 20.00, NOW(), NOW() + INTERVAL '5 years', 1000, 1, true),
  ('ZONE50', 'fixed', 50.00, 200.00, NULL, NOW(), NOW() + INTERVAL '5 years', 500, 2, true),
  ('SUPERTOY', 'percentage', 15.00, 50.00, 30.00, NOW(), NOW() + INTERVAL '5 years', 300, 1, true)
ON CONFLICT (code) DO NOTHING;
