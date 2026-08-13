/**
 * utils/phoneUtils.ts — Helper utilities for Indian (+91) mobile numbers.
 */

/**
 * Extracts pure 10-digit mobile number from any input (strips country code & non-digits).
 * Example: "+91 9876543210" → "9876543210"
 */
export function sanitize10Digits(input?: string | null): string {
  if (!input) return '';
  let digits = input.replace(/\D/g, '');

  // If input includes 91 country code prefix and is longer than 10 digits
  if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
}

/**
 * Formats 10 digits into E.164 international format (+91XXXXXXXXXX) for API payload.
 */
export function toFullIndianPhone(digits: string): string {
  const clean = sanitize10Digits(digits);
  return clean ? `+91${clean}` : '';
}

/**
 * Validates that string contains exactly 10 numeric digits.
 */
export function isValid10DigitMobile(digits: string): boolean {
  return sanitize10Digits(digits).length === 10;
}

/**
 * Backward compatibility helper for full "+91 XXXXXXXXXX" format.
 */
export function formatIndianMobile(input: string): string {
  const clean = sanitize10Digits(input);
  return clean ? `+91 ${clean}` : '+91 ';
}

/**
 * Backward compatibility alias for sanitize10Digits.
 */
export function getMobileDigits(formatted: string): string {
  return sanitize10Digits(formatted);
}
