import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Automatically appends "/-" to property price if not already present.
 * Handles cases where admin adds "/-", "/ -", or leaves raw price like "₹ 45,00,000", "50 Lakhs", "₹ 25,000 / month", etc.
 */
export function formatPriceWithSlash(price?: string | number | null): string {
  if (!price && price !== 0) return '';
  let str = String(price).trim();
  if (!str) return '';

  // If price already ends with /- or /-, normalize to /-
  if (str.endsWith('/-') || str.endsWith('/ -')) {
    return str.replace(/\/ -$/, '/-');
  }

  // Handle rental / periodic prices like "₹ 25,000 / month", "₹ 20,000/mo", "₹ 50,000 / Month", "/year", "/sq.ft", etc.
  const perPeriodRegex = /(\s*\/\s*(?:month|mo|year|yr|day|night|week|sq\.?\s*ft|acre|cent|sq\.?\s*yd|annum\b.*))$/i;
  const match = str.match(perPeriodRegex);
  if (match) {
    const period = match[0];
    const base = str.slice(0, -period.length).trim();
    if (base.endsWith('/-') || base.endsWith('/ -')) {
      return `${base.replace(/\/ -$/, '/-')}${period}`;
    }
    return `${base}/-${period}`;
  }

  // If trailing slash alone, append '-'
  if (str.endsWith('/')) {
    return `${str}-`;
  }

  // Standard price -> append '/-'
  return `${str}/-`;
}
