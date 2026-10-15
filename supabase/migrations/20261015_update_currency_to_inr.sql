-- ==============================================================================
-- SALALAKART ZONE — MIGRATION: UPDATE CURRENCY TO INDIAN RUPEES (INR / ₹)
-- Safe migration: preserves all existing products, orders, and tables without dropping data.
-- ==============================================================================

-- 1. Ensure payments default currency is INR
ALTER TABLE IF EXISTS public.payments 
  ALTER COLUMN currency SET DEFAULT 'INR';

-- 2. Update existing payment rows where currency was set to 'USD' to 'INR'
UPDATE public.payments 
  SET currency = 'INR' 
  WHERE currency = 'USD';

-- 3. Update store_settings general_settings json if exists
UPDATE public.store_settings
SET value = jsonb_set(
  jsonb_set(value, '{currency_code}', '"INR"'),
  '{currency_symbol}',
  '"₹"'
)
WHERE key = 'general_settings' AND value IS NOT NULL;
