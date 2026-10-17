-- ==============================================================================
-- SALALAKART ZONE — REALTIME SYNCHRONIZATION MIGRATION
-- Migration: 20261017_enable_instant_realtime_synchronization.sql
-- Description: Enable PostgreSQL Realtime publication and REPLICA IDENTITY FULL
--              for banners, products, categories, product_images, and product_variants
--              to ensure instant CDC WebSocket streaming to customer-facing clients.
-- ==============================================================================

-- 1. Ensure REPLICA IDENTITY is set to FULL for all catalog tables so UPDATE and DELETE events emit complete row data
ALTER TABLE IF EXISTS public.banners REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.products REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.categories REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.product_images REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.product_variants REPLICA IDENTITY FULL;

-- 2. Add catalog tables to supabase_realtime publication (if not already included)
DO $$
BEGIN
  -- banners
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'banners'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
  END IF;

  -- products
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;

  -- categories
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  END IF;

  -- product_images
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'product_images'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.product_images;
  END IF;

  -- product_variants
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'product_variants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;
  END IF;
END $$;

-- 3. Notify PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
