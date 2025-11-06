/**
 * Supported currencies
 */
export const CURRENCIES = {
  NGN: 'NGN', // Nigerian Naira
  USD: 'USD', // US Dollar
  GBP: 'GBP', // British Pound
  EUR: 'EUR', // Euro
  KES: 'KES', // Kenyan Shilling
  GHS: 'GHS', // Ghanaian Cedi
  ZAR: 'ZAR', // South African Rand
} as const;

/**
 * Currency metadata
 */
export const CURRENCY_META = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    decimal_digits: 2,
    subunit: 100, // 1 Naira = 100 Kobo
    subunit_name: 'Kobo',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimal_digits: 2,
    subunit: 100, // 1 Dollar = 100 Cents
    subunit_name: 'Cent',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimal_digits: 2,
    subunit: 100, // 1 Pound = 100 Pence
    subunit_name: 'Penny',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimal_digits: 2,
    subunit: 100, // 1 Euro = 100 Cents
    subunit_name: 'Cent',
  },
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    decimal_digits: 2,
    subunit: 100, // 1 Shilling = 100 Cents
    subunit_name: 'Cent',
  },
  GHS: {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: '₵',
    decimal_digits: 2,
    subunit: 100, // 1 Cedi = 100 Pesewas
    subunit_name: 'Pesewa',
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    decimal_digits: 2,
    subunit: 100, // 1 Rand = 100 Cents
    subunit_name: 'Cent',
  },
} as const;

/**
 * Currency limits (in smallest unit - kobo, cents, etc.)
 */
export const CURRENCY_LIMITS = {
  NGN: {
    min: 100, // ₦1.00
    max: 100_000_000_00, // ₦100,000,000.00
  },
  USD: {
    min: 100, // $1.00
    max: 10_000_000_00, // $10,000,000.00
  },
  GBP: {
    min: 100, // £1.00
    max: 10_000_000_00, // £10,000,000.00
  },
  EUR: {
    min: 100, // €1.00
    max: 10_000_000_00, // €10,000,000.00
  },
  KES: {
    min: 100, // KSh 1.00
    max: 100_000_000_00, // KSh 100,000,000.00
  },
  GHS: {
    min: 100, // ₵1.00
    max: 100_000_000_00, // ₵100,000,000.00
  },
  ZAR: {
    min: 100, // R1.00
    max: 100_000_000_00, // R100,000,000.00
  },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
