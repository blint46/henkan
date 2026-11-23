import { ALIAS_PATTERN_SOURCE, lookupAlias, UNIT_REGEX } from './alias-index';
import { matchesAliasContext } from './alias-context';
import { computeConfidence } from './confidence';
import { NUMBER_PATTERN, parseNumberBefore, parseNumericString } from './number-parser';
import { skipSpaceBackwards } from './text';
import type {
  DetectionResult,
  UnitDefinition,
  UnitDiagnostic,
  UnitMatch,
} from './types';

const COMPOUND_OPERATORS = new Set(['/', '·', '*', '^']);
const UNIT_TOKEN_PATTERN = /^[A-Za-zµ°][A-Za-z0-9µ°]*(?:\^[+-]?\d+)?/;

const REPEATED_RANGE_REGEX = new RegExp(
  String.raw`^\s*(?:([-–—~])|(to|through|thru))\s*(${NUMBER_PATTERN})\s*(${ALIAS_PATTERN_SOURCE})(?![A-Za-z0-9])`,
  'i',
);

/**
 * `5 kg/xyz` is a compound we do not know. Report it instead of emitting a
 * misleading `5 kg`. Numeric denominators (`5 kg/10`) stay valid.
 */
const findUnknownCompound = (
  input: string,
  unitEnd: number,
  numberStart: number,
  values: number[],
  unit: UnitDefinition,
): UnitDiagnostic | null => {
  let cursor = unitEnd;
  while (cursor < input.length && /\s/.test(input[cursor] ?? '')) cursor += 1;

  const operator = input[cursor];
  if (!operator || !COMPOUND_OPERATORS.has(operator)) return null;

  cursor += 1;
  while (cursor < input.length && /\s/.test(input[cursor] ?? '')) cursor += 1;

  const rest = input.slice(cursor);
  if (/^[0-9+\-.]/.test(rest)) return null;

  const tokenMatch = rest.match(UNIT_TOKEN_PATTERN);
  if (!tokenMatch) return null;

  const unknownToken = tokenMatch[0];
  const end = cursor + unknownToken.length;

  return {
    raw: input.slice(numberStart, end),
    values,
    knownUnit: unit,
    unknownToken,
    start: numberStart,
    end,
    reason: 'unknown-compound',
  };
};

/** Include the closing bracket of `5 (kg)` in the detected expression. */
const parenthesizedEnd = (
  input: string,
  unitStart: number,
  unitEnd: number,
): number => {
  const before = skipSpaceBackwards(input, unitStart);
  const open = input[before - 1];
  if (open !== '(' && open !== '[') return unitEnd;

  const close = open === '(' ? ')' : ']';
  let cursor = unitEnd;
  while (cursor < input.length && /\s/.test(input[cursor] ?? '')) cursor += 1;

  return input[cursor] === close ? cursor + 1 : unitEnd;
};

/**
 * Collapse ranges with a repeated unit (`5°C-10°C`, `5 kg to 10 kg`) into a
 * single detection. Mixed units stay separate.
 */
const parseRepeatedRange = (
  input: string,
  expressionEnd: number,
  unit: UnitDefinition,
): { value: number; end: number } | null => {
  const match = input.slice(expressionEnd).match(REPEATED_RANGE_REGEX);
  if (!match) return null;

  const aliasText = match[4] ?? '';
  const entry = lookupAlias(aliasText);
  if (!entry || entry.unit.id !== unit.id) return null;

  const value = parseNumericString(match[3] ?? '');
  if (!Number.isFinite(value)) return null;

  return {
    value,
    end: expressionEnd + (match.index ?? 0) + match[0].length,
  };
};

export const detectUnits = (input: string): DetectionResult => {
  const detections: UnitMatch[] = [];
  const diagnostics: UnitDiagnostic[] = [];
  UNIT_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = UNIT_REGEX.exec(input)) !== null) {
    const matchedText = match[0];
    const entry = lookupAlias(matchedText);
    if (!entry) continue;

    const unitStart = match.index;
    const unitEnd = unitStart + matchedText.length;
    const number = parseNumberBefore(input, unitStart);
    if (!number) continue;

    if (!matchesAliasContext(input, entry.alias, unitStart, unitEnd, number.start)) {
      continue;
    }

    const diagnostic = findUnknownCompound(
      input,
      unitEnd,
      number.start,
      number.values,
      entry.unit,
    );
    if (diagnostic) {
      diagnostics.push(diagnostic);
      UNIT_REGEX.lastIndex = diagnostic.end;
      continue;
    }

    const expressionEnd = parenthesizedEnd(input, unitStart, unitEnd);
    const repeated = parseRepeatedRange(input, expressionEnd, entry.unit);

    const values = repeated ? [...number.values, repeated.value] : number.values;
    const end = repeated ? repeated.end : expressionEnd;

    if (repeated) UNIT_REGEX.lastIndex = repeated.end;

    detections.push({
      raw: input.slice(number.start, end),
      values,
      unit: entry.unit,
      category: entry.unit.category,
      start: number.start,
      end,
      confidence: computeConfidence(input, entry.alias, unitEnd, number.start),
    });
  }

  return { detections, diagnostics };
};
