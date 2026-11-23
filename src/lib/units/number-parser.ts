import { isBoundary, skipSpaceBackwards } from './text';

export const NUMBER_PATTERN =
  String.raw`[+-]?(?:\d{1,3}(?:[.,\s]\d{3})+|\d+|\.\d+)(?:[.,]\d+)?(?:[eE^][+-]?\d+)?`;

const UNICODE_FRACTIONS: Record<string, number> = {
  '¼': 1 / 4,
  '½': 1 / 2,
  '¾': 3 / 4,
  '⅐': 1 / 7,
  '⅑': 1 / 9,
  '⅒': 1 / 10,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅕': 1 / 5,
  '⅖': 2 / 5,
  '⅗': 3 / 5,
  '⅘': 4 / 5,
  '⅙': 1 / 6,
  '⅚': 5 / 6,
  '⅛': 1 / 8,
  '⅜': 3 / 8,
  '⅝': 5 / 8,
  '⅞': 7 / 8,
};

export type ParsedNumber = {
  values: number[];
  start: number;
  end: number;
};

export const parseNumericString = (raw: string): number => {
  let value = raw.trim();
  const sign = value.startsWith('-') ? -1 : 1;
  value = value.replace(/^[+-]/, '');

  let exponent = 0;
  let exponentKind: 'scientific' | 'power' | null = null;
  const exponentMatch = value.match(/([eE^])([+-]?\d+)$/);
  if (exponentMatch) {
    exponentKind = exponentMatch[1] === '^' ? 'power' : 'scientific';
    exponent = Number(exponentMatch[2]);
    value = value.slice(0, exponentMatch.index ?? 0);
  }

  value = value.replace(/\s+/g, '');
  const lastComma = value.lastIndexOf(',');
  const lastDot = value.lastIndexOf('.');
  const decimalSeparator =
    lastComma > lastDot ? ',' : lastDot > lastComma ? '.' : null;

  if (decimalSeparator) {
    const separatorCount = value.split(decimalSeparator).length - 1;
    const decimalIndex = value.lastIndexOf(decimalSeparator);
    const integerPart = value.slice(0, decimalIndex);
    const fractionalPart = value.slice(decimalIndex + 1);
    const otherSeparator = decimalSeparator === ',' ? '.' : ',';

    if (
      separatorCount > 1 ||
      (fractionalPart.length === 3 &&
        !value.includes(otherSeparator) &&
        integerPart.length <= 3)
    ) {
      value = value.replaceAll(decimalSeparator, '');
    } else {
      value = value.replaceAll(otherSeparator, '').replace(decimalSeparator, '.');
    }
  }

  const numeric = Number(value);
  if (exponentKind === 'power') return sign * numeric ** exponent;
  return sign * numeric * 10 ** exponent;
};

const parseFraction = (input: string, end: number): ParsedNumber | null => {
  const slice = input.slice(0, end);

  const unicodeMatch = slice.match(
    /(?:(\d+)\s*)?([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/,
  );
  if (unicodeMatch) {
    const fraction = UNICODE_FRACTIONS[unicodeMatch[2] ?? ''];
    if (fraction !== undefined) {
      const whole = unicodeMatch[1] ? Number(unicodeMatch[1]) : 0;
      const start = unicodeMatch.index ?? 0;
      if (!isBoundary(input, start - 1)) return null;
      return { values: [whole + fraction], start, end };
    }
  }

  const fractionMatch = slice.match(/(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    const denominator = Number(fractionMatch[3] ?? '');
    if (!Number.isFinite(denominator) || denominator === 0) return null;
    const whole = fractionMatch[1] ? Number(fractionMatch[1]) : 0;
    const value = whole + Number(fractionMatch[2] ?? '') / denominator;
    const start = fractionMatch.index ?? 0;
    if (!isBoundary(input, start - 1)) return null;
    return { values: [value], start, end };
  }

  return null;
};

const parseRange = (input: string, end: number): ParsedNumber | null => {
  const slice = input.slice(0, end);
  const rangeRegex = new RegExp(
    `(${NUMBER_PATTERN})\\s*(?:[-–—~]|to|through|thru)\\s*(${NUMBER_PATTERN})$`,
    'i',
  );
  const match = slice.match(rangeRegex);
  if (!match) return null;

  const start = match.index ?? 0;
  if (!isBoundary(input, start - 1)) return null;

  const first = parseNumericString(match[1] ?? '');
  const second = parseNumericString(match[2] ?? '');
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;

  return { values: [first, second], start, end };
};

/**
 * A hyphen directly after a letter, digit, degree sign, or closing bracket is
 * a separator, not a minus sign (`5°C-10°C`, `5kg-10kg`).
 */
const isSeparatorHyphen = (input: string, index: number): boolean => {
  const before = input[index - 1];
  return before !== undefined && /[A-Za-z0-9°)]/.test(before);
};

const parseSingleNumber = (input: string, end: number): ParsedNumber | null => {
  const slice = input.slice(0, end);
  const singleRegex = new RegExp(`(${NUMBER_PATTERN})$`);
  const match = slice.match(singleRegex);
  if (!match) return null;

  let start = match.index ?? 0;
  let raw = match[1] ?? '';

  if (
    (raw.startsWith('-') || raw.startsWith('+')) &&
    isSeparatorHyphen(input, start)
  ) {
    raw = raw.slice(1);
    start += 1;
  }

  if (!isBoundary(input, start - 1)) return null;

  const value = parseNumericString(raw);
  if (!Number.isFinite(value)) return null;

  return { values: [value], start, end };
};

export const parseNumberBefore = (
  input: string,
  unitStart: number,
): ParsedNumber | null => {
  let end = skipSpaceBackwards(input, unitStart);

  // Handle adjectives and parenthesized units: "5-km", "5 (kg)".
  const charBefore = input[end - 1];
  if (charBefore === '(' || charBefore === '[') {
    end = skipSpaceBackwards(input, end - 1);
  } else if (charBefore === '-' || charBefore === '–' || charBefore === '—') {
    end = skipSpaceBackwards(input, end - 1);
  }

  return (
    parseFraction(input, end) ??
    parseRange(input, end) ??
    parseSingleNumber(input, end)
  );
};
