/**
 * Canonical money representation: integer USD cents.
 * String↔cents conversion is integer math end to end — a float never
 * touches an amount (1234567.89 * 100 === 123456788.99999999).
 */

const USD_PATTERN = /^\d+(\.\d{0,2})?$/;

export const usdToCents = (input: string): number | null => {
  const clean = input.replaceAll(',', '').trim();

  if (!USD_PATTERN.test(clean)) return null;

  const [whole, fraction = ''] = clean.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));

  return Number.isSafeInteger(cents) ? cents : null;
};

export const centsToUsd = (cents: number): string => {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, '0');

  return `${whole.toLocaleString('en-US')}.${fraction}`;
};

export const formatCurrency = (cents: number) => {
  return `$${centsToUsd(cents)}`;
};
