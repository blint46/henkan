export const UNIT_CATEGORIES = [
  'temperature',
  'length',
  'mass',
  'volume',
  'area',
  'area-density',
  'speed',
  'acceleration',
  'energy',
  'pressure',
  'power',
  'force',
  'torque',
  'time',
  'data',
  'angle',
  'frequency',
  'fuel-economy',
] as const;

export type UnitCategory = (typeof UNIT_CATEGORIES)[number];

export type AliasOptions = {
  /** Alias text as it should appear in the page. */
  text: string;
  /** Match casing exactly. Symbols like `m`, `K`, `Pa` are case-sensitive. */
  caseSensitive?: boolean;
  /** Match only when there is whitespace before the alias (e.g. `5 K`). */
  requireSpace?: boolean;
  /**
   * Reject when the alias is followed by a word, unless that word is a
   * connector such as `to`, `of`, `and`, `or`, `per`, `by`, `x`.
   * Useful for aliases that are also common English words (`in`).
   */
  rejectIfFollowedByWord?: boolean;
  /** Reject when the number is preceded by a currency symbol (`$5m`). */
  rejectIfPrecededByCurrency?: boolean;
};

export type UnitDefinition = {
  /** Stable, category-prefixed slug, e.g. `length-meter`. */
  id: string;
  /** Canonical symbol, e.g. `km`. */
  symbol: string;
  /** Human-readable name, e.g. `kilometer`. */
  name: string;
  category: UnitCategory;
  aliases: AliasOptions[];
};

export type DetectionConfidence = 'high' | 'low';

/** A detection before it is mapped back onto DOM text nodes. */
export type UnitMatch = {
  /** The full matched text, e.g. `5.5 km`. */
  raw: string;
  /** All parsed values. Contains one item unless the match was a range. */
  values: number[];
  unit: UnitDefinition;
  category: UnitCategory;
  /** Start index inside the scanned text. */
  start: number;
  /** End index inside the scanned text. */
  end: number;
  /** `low` is used for ambiguous aliases such as bare `K`. */
  confidence: DetectionConfidence;
};

export type SourceRange = {
  startNode: Text;
  startOffset: number;
  endNode: Text;
  endOffset: number;
};

/** A detection mapped onto the DOM. */
export type DetectedUnit = UnitMatch & {
  range: SourceRange;
};

export type DiagnosticReason = 'unknown-compound';

/** An expression that looks like a unit but is not registered. */
export type UnitDiagnostic = {
  raw: string;
  values: number[];
  knownUnit: UnitDefinition;
  unknownToken: string;
  start: number;
  end: number;
  reason: DiagnosticReason;
};

export type ScannedDiagnostic = UnitDiagnostic & {
  range: SourceRange;
};

export type ScanUnitResult = {
  element: Element;
  detections: DetectedUnit[];
  diagnostics: ScannedDiagnostic[];
};

export type DetectionResult = {
  detections: UnitMatch[];
  diagnostics: UnitDiagnostic[];
};
