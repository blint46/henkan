import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { detectUnits } from './detect';
import type {
  DetectedUnit,
  ScanUnitResult,
  ScannedDiagnostic,
  SourceRange,
} from './types';

const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'body', 'caption', 'dd',
  'details', 'dialog', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure',
  'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup',
  'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul',
]);

const BLOCK_SELECTOR = [...BLOCK_TAGS].join(',');

const SKIP_SELECTOR = [
  'script', 'style', 'noscript', 'textarea', 'input', 'select', 'option',
  'button', 'code', 'pre', 'svg', 'math', 'canvas', 'iframe', 'template',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

const isBlockElement = (element: Element): boolean =>
  BLOCK_TAGS.has(element.tagName.toLowerCase());

const isInsideSkipped = (element: Element): boolean =>
  element.closest(SKIP_SELECTOR) !== null;

/** Separates text across skipped or nested-block boundaries. */
const BOUNDARY = '\u0000';

type CharSource = {
  node: Text;
  offset: number;
};

type ExtractedText = {
  /** NFKC-normalized text used for matching. */
  text: string;
  /** Source for every character in `text`; `null` for synthetic separators. */
  sources: Array<CharSource | null>;
  /** Original text with synthetic separators removed. */
  original: string;
  /** Original offset for every character in `text`. */
  originalIndex: number[];
};

const UNICODE_FRACTION_CHAR = /^[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]$/;

const normalizeChar = (char: string): string => {
  const normalized = char
    .normalize('NFKC')
    .replaceAll('⁄', '/')
    .replaceAll('∕', '/')
    .replaceAll('′′', '″')
    .replaceAll('−', '-')
    .replace(/[‐‑]/g, '-');

  // Keep a boundary between a whole number and a vulgar fraction so `1½`
  // normalizes to `1 1/2` instead of `11/2`.
  return UNICODE_FRACTION_CHAR.test(char) ? ` ${normalized}` : normalized;
};

const createExtracted = (): ExtractedText => ({
  text: '',
  sources: [],
  original: '',
  originalIndex: [],
});

const appendOriginal = (
  extracted: ExtractedText,
  char: string,
  node: Text,
  offset: number,
): void => {
  const base = extracted.original.length;
  extracted.original += char;

  for (const normalized of normalizeChar(char)) {
    extracted.text += normalized;
    extracted.sources.push({ node, offset });
    extracted.originalIndex.push(base);
  }
};

const appendSynthetic = (extracted: ExtractedText, char: string): void => {
  const base = extracted.original.length;
  extracted.text += char;
  extracted.sources.push(null);
  extracted.originalIndex.push(base);
};

const extractText = (root: Element): ExtractedText => {
  const extracted = createExtracted();

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode(node: Node): number {
        if (node instanceof Text) return NodeFilter.FILTER_ACCEPT;
        if (!(node instanceof Element)) return NodeFilter.FILTER_REJECT;

        if (isInsideSkipped(node)) {
          appendSynthetic(extracted, BOUNDARY);
          return NodeFilter.FILTER_REJECT;
        }

        const tag = node.tagName.toLowerCase();
        if (tag === 'br') {
          appendSynthetic(extracted, ' ');
          return NodeFilter.FILTER_ACCEPT;
        }
        if (tag === 'sup') {
          appendSynthetic(extracted, '^');
          return NodeFilter.FILTER_ACCEPT;
        }
        if (tag === 'sub') return NodeFilter.FILTER_ACCEPT;
        if (isBlockElement(node)) {
          appendSynthetic(extracted, BOUNDARY);
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  let current = walker.nextNode();
  while (current) {
    if (current instanceof Text) {
      const data = current.data;
      for (let index = 0; index < data.length; index += 1) {
        const char = data[index];
        if (char !== undefined) appendOriginal(extracted, char, current, index);
      }
    }
    current = walker.nextNode();
  }

  return extracted;
};

const sourceAt = (
  extracted: ExtractedText,
  index: number,
  direction: 1 | -1,
): CharSource | null => {
  if (direction === 1) {
    for (let cursor = index; cursor < extracted.sources.length; cursor += 1) {
      const source = extracted.sources[cursor];
      if (source) return source;
    }
    return null;
  }

  for (let cursor = index; cursor >= 0; cursor -= 1) {
    const source = extracted.sources[cursor];
    if (source) return source;
  }
  return null;
};

const mapRange = (
  extracted: ExtractedText,
  start: number,
  end: number,
): SourceRange | null => {
  const startSource = sourceAt(extracted, start, 1);
  const endSource = sourceAt(extracted, end - 1, -1);
  if (!startSource || !endSource) return null;

  return {
    startNode: startSource.node,
    startOffset: startSource.offset,
    endNode: endSource.node,
    endOffset: endSource.offset + 1,
  };
};

const originalRange = (
  extracted: ExtractedText,
  start: number,
  end: number,
): { raw: string; start: number; end: number } => {
  const startOffset =
    start < extracted.originalIndex.length
      ? (extracted.originalIndex[start] ?? extracted.original.length)
      : extracted.original.length;
  const endOffset =
    end < extracted.originalIndex.length
      ? (extracted.originalIndex[end] ?? extracted.original.length)
      : extracted.original.length;

  return {
    raw: extracted.original.slice(startOffset, endOffset),
    start: startOffset,
    end: endOffset,
  };
};

export const scanElement = (element: Element): ScanUnitResult | null => {
  if (!isBlockElement(element) || isInsideSkipped(element)) return null;

  const extracted = extractText(element);
  if (extracted.text.replaceAll(BOUNDARY, '').trim().length === 0) return null;

  const { detections, diagnostics } = detectUnits(extracted.text);

  const mappedDetections: DetectedUnit[] = [];
  for (const detection of detections) {
    const range = mapRange(extracted, detection.start, detection.end);
    if (!range) continue;
    mappedDetections.push({
      ...detection,
      ...originalRange(extracted, detection.start, detection.end),
      range,
    });
  }

  const mappedDiagnostics: ScannedDiagnostic[] = [];
  for (const diagnostic of diagnostics) {
    const range = mapRange(extracted, diagnostic.start, diagnostic.end);
    if (!range) continue;
    mappedDiagnostics.push({
      ...diagnostic,
      ...originalRange(extracted, diagnostic.start, diagnostic.end),
      range,
    });
  }

  return { element, detections: mappedDetections, diagnostics: mappedDiagnostics };
};

export type ScanListener = (result: ScanUnitResult) => void;

const logScanResult = (result: ScanUnitResult): void => {
  if (result.detections.length === 0 && result.diagnostics.length === 0) return;

  console.groupCollapsed(
    `[Henkan] ${result.element.tagName.toLowerCase()} — ${result.detections.length} unit${result.detections.length === 1 ? '' : 's'}`,
  );

  if (result.detections.length > 0) {
    console.table(
      result.detections.map((detection) => ({
        raw: detection.raw,
        values: detection.values.join('–'),
        category: detection.category,
        unit: detection.unit.symbol,
        confidence: detection.confidence,
      })),
    );
  }

  if (result.diagnostics.length > 0) {
    console.table(
      result.diagnostics.map((diagnostic) => ({
        raw: diagnostic.raw,
        knownUnit: diagnostic.knownUnit.symbol,
        unknownToken: diagnostic.unknownToken,
        reason: diagnostic.reason,
      })),
    );
  }

  console.groupEnd();
};

const nearestBlock = (node: Node): Element | null => {
  const start = node instanceof Element ? node : node.parentElement;
  if (!start || isInsideSkipped(start)) return null;

  let element: Element | null = start;
  while (element) {
    if (isBlockElement(element)) return element;
    element = element.parentElement;
  }
  return null;
};

/** Every scannable block in `node`'s subtree, including `node` itself. */
const collectBlocks = (node: Node): Element[] => {
  if (!(node instanceof Element)) return [];

  const blocks: Element[] = [];
  if (isBlockElement(node) && !isInsideSkipped(node)) blocks.push(node);

  for (const element of node.querySelectorAll(BLOCK_SELECTOR)) {
    if (!isInsideSkipped(element)) blocks.push(element);
  }

  return blocks;
};

export type ScannerOptions = {
  /** Subtree to scan. Defaults to `document.body`. */
  root?: Element | null;
  /** Receives every result. Defaults to console logging. */
  listener?: ScanListener;
};

/**
 * Scans block-level elements and reports detections through `listener`.
 * Mutations are debounced; only affected blocks are rescanned.
 */
export const startUnitScanner = (
  ctx: ContentScriptContext,
  { root = document.body, listener = logScanResult }: ScannerOptions = {},
): void => {
  if (!root) return;

  const pending = new Set<Element>();
  const removed = new Set<Element>();
  /** Blocks that currently have reported results. */
  const reported = new WeakSet<Element>();
  let timer: number | undefined;

  const reportEmpty = (element: Element): void => {
    listener({ element, detections: [], diagnostics: [] });
  };

  /**
   * Reports a block's current results. A block that previously reported
   * results and now has none emits exactly one empty result, so listeners can
   * drop stale UI.
   */
  const emit = (element: Element): void => {
    const result = element.isConnected ? scanElement(element) : null;
    const hasResults =
      result !== null &&
      (result.detections.length > 0 || result.diagnostics.length > 0);

    if (hasResults) {
      reported.add(element);
      listener(result);
      return;
    }

    if (reported.delete(element)) reportEmpty(element);
  };

  /**
   * Drains queued blocks. Removals are cleared first: a block that was removed
   * and re-added before the flush is still connected, so it gets rescanned
   * instead of reported empty.
   */
  const flush = (): void => {
    timer = undefined;

    for (const element of removed) {
      if (element.isConnected) continue;
      if (reported.delete(element)) reportEmpty(element);
    }
    removed.clear();

    const elements = [...pending];
    pending.clear();
    for (const element of elements) emit(element);
  };

  const scheduleFlush = (): void => {
    if (timer === undefined) timer = ctx.setTimeout(flush, 100);
  };

  const enqueue = (element: Element | null): void => {
    if (!element) return;
    pending.add(element);
    scheduleFlush();
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      enqueue(nearestBlock(mutation.target));
      if (mutation.type === 'characterData') continue;

      for (const added of mutation.addedNodes) {
        for (const element of collectBlocks(added)) enqueue(element);
        enqueue(nearestBlock(added));
      }

      for (const removedNode of mutation.removedNodes) {
        for (const element of collectBlocks(removedNode)) removed.add(element);
      }
    }

    if (removed.size > 0) scheduleFlush();
  });

  observer.observe(root, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  ctx.onInvalidated(() => observer.disconnect());

  for (const element of collectBlocks(root)) emit(element);
};
