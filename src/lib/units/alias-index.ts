import { UNITS } from './registry';
import type { AliasOptions, UnitDefinition } from './types';

export type IndexedAlias = {
  alias: AliasOptions;
  unit: UnitDefinition;
};

const exactAliases = new Map<string, IndexedAlias>();
const lowerAliases = new Map<string, IndexedAlias>();

for (const unit of UNITS) {
  for (const alias of unit.aliases) {
    const entry = { alias, unit };
    exactAliases.set(alias.text, entry);
    if (!alias.caseSensitive) {
      lowerAliases.set(alias.text.toLowerCase(), entry);
    }
  }
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The regex is case-insensitive, so one lowercase spelling per alias is enough.
const uniqueAliasTexts = [
  ...new Set([...exactAliases.keys()].map((text) => text.toLowerCase())),
].sort((a, b) => b.length - a.length);

export const ALIAS_PATTERN_SOURCE = uniqueAliasTexts.map(escapeRegExp).join('|');

export const UNIT_REGEX = new RegExp(
  `(?<![A-Za-z])(?:${ALIAS_PATTERN_SOURCE})(?![A-Za-z0-9])`,
  'gi',
);

export const lookupAlias = (matchedText: string): IndexedAlias | undefined =>
  exactAliases.get(matchedText) ?? lowerAliases.get(matchedText.toLowerCase());
