import { nextWord, skipSpaceBackwards } from './text';
import type { AliasOptions } from './types';

const CURRENCY_SYMBOLS = new Set([
  '$', '€', '£', '¥', '₹', '₽', '₩', '₺', '₴', '₦', '₱', '฿', '₫', '₪',
  '₡', '₲', '₵', '₸', '₼', '₾', '₿',
]);

const CURRENCY_CODES = new Set([
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'CNY', 'INR',
  'RUB', 'KRW', 'TRY', 'UAH', 'NGN', 'PHP', 'THB', 'VND', 'ILS', 'BRL',
]);

const CONNECTOR_WORDS = new Set([
  'to', 'of', 'and', 'or', 'per', 'by', 'at', 'for', 'in', 'on', 'with',
  'without', 'from', 'after', 'before', 'later', 'ago', 'long', 'wide',
  'tall', 'high', 'deep', 'thick', 'thin', 'away', 'apart', 'each',
  'every', 'than', 'as', 'x', '×', '/', '-', '–', '—', '~',
]);

export const hasCurrencyBefore = (input: string, index: number): boolean => {
  const cursor = skipSpaceBackwards(input, index);
  const char = input[cursor - 1];
  if (char && CURRENCY_SYMBOLS.has(char)) return true;

  const before = input.slice(0, cursor).match(/([A-Za-z]{3})$/);
  return before ? CURRENCY_CODES.has((before[1] ?? '').toUpperCase()) : false;
};

export const matchesAliasContext = (
  input: string,
  alias: AliasOptions,
  unitStart: number,
  unitEnd: number,
  numberStart: number,
): boolean => {
  if (alias.requireSpace && unitStart > 0 && !/\s/.test(input[unitStart - 1] ?? '')) {
    return false;
  }

  if (alias.rejectIfPrecededByCurrency && hasCurrencyBefore(input, numberStart)) {
    return false;
  }

  if (alias.rejectIfFollowedByWord) {
    const word = nextWord(input, unitEnd);
    if (word && !CONNECTOR_WORDS.has(word.toLowerCase())) return false;
  }

  return true;
};
