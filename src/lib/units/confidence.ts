import { hasCurrencyBefore } from './alias-context';
import { nextWord, previousWord } from './text';
import type { AliasOptions, DetectionConfidence } from './types';

const DIMENSION_WORDS = new Set([
  'tall', 'wide', 'long', 'high', 'deep', 'thick', 'thin', 'away', 'apart',
  'of', 'by', 'x', '×', 'to', 'and', 'or', 'at', 'from', 'across',
  'around', 'each', 'every',
]);

const MEASUREMENT_CUES = new Set([
  'weigh', 'weighs', 'weighed', 'weight', 'mass', 'speed', 'velocity',
  'temperature', 'temp', 'pressure', 'distance', 'height', 'width', 'depth',
  'length', 'volume', 'area', 'size', 'power', 'energy', 'duration', 'time',
  'diameter', 'radius', 'circumference', 'capacity', 'dose', 'dosage',
  'amount', 'force', 'torque', 'frequency', 'resolution',
]);

const DOWNGRADE_CUES = new Set([
  'version', 'v', 'build', 'release', 'chapter', 'section', 'page', 'item',
  'step', 'model', 'no', 'number', 'jan', 'january', 'feb', 'february',
  'mar', 'march', 'apr', 'april', 'may', 'jun', 'june', 'jul', 'july',
  'aug', 'august', 'sep', 'september', 'oct', 'october', 'nov', 'november',
  'dec', 'december',
]);

const DIMENSION_SYMBOL_AFTER = /^\s*[x×](?![A-Za-z])/;
const DIMENSION_SYMBOL_BEFORE = /[x×](?![A-Za-z])\s*$/;

const hasCueBefore = (
  input: string,
  index: number,
  cues: Set<string>,
  window = 48,
): boolean => {
  const words = input
    .slice(Math.max(0, index - window), index)
    .toLowerCase()
    .match(/[a-z]+/g);
  return words ? words.some((word) => cues.has(word)) : false;
};

const isAmbiguous = (alias: AliasOptions): boolean =>
  Boolean(
    alias.requireSpace ||
      alias.rejectIfFollowedByWord ||
      alias.rejectIfPrecededByCurrency,
  );

/**
 * Confidence is evidence-based: unambiguous aliases start high, ambiguous ones
 * start low, and nearby measurement context can move a match either way.
 */
export const computeConfidence = (
  input: string,
  alias: AliasOptions,
  unitEnd: number,
  numberStart: number,
): DetectionConfidence => {
  let high = !isAmbiguous(alias);

  const next = nextWord(input, unitEnd);
  if (next && DIMENSION_WORDS.has(next.toLowerCase())) high = true;
  if (DIMENSION_SYMBOL_AFTER.test(input.slice(unitEnd))) high = true;

  const previous = previousWord(input, numberStart);
  if (DIMENSION_SYMBOL_BEFORE.test(input.slice(0, numberStart))) high = true;
  if (previous) {
    const word = previous.toLowerCase();
    if (DIMENSION_WORDS.has(word)) high = true;
    if (DOWNGRADE_CUES.has(word)) high = false;
  }

  if (hasCueBefore(input, numberStart, MEASUREMENT_CUES)) high = true;

  if (hasCurrencyBefore(input, numberStart)) high = false;
  if (hasCueBefore(input, numberStart, DOWNGRADE_CUES, 24)) high = false;

  return high ? 'high' : 'low';
};
