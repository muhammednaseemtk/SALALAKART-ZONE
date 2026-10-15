/**
 * SALALAKART ZONE — Currency and Price Formatting Utilities
 * Standardized for Indian Rupees (INR / ₹) across the entire application.
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
export const CURRENCY_LOCALE = 'en-IN';

/**
 * Formats a monetary number into Indian Rupees (INR)
 * Example: 1299 -> "₹1,299.00", 12999 -> "₹12,999.00"
 */
export const formatPrice = (amount: number | string | null | undefined): string => {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount) || 0;

  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Converts an INR amount to paise for payment gateways (e.g., Razorpay)
 */
export const toPaise = (amountInInr: number): number => {
  return Math.round(Number(amountInInr || 0) * 100);
};

/**
 * Converts paise back to INR
 */
export const fromPaise = (amountInPaise: number): number => {
  return Number(amountInPaise || 0) / 100;
};
