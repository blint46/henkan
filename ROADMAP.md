# Roadmap

Everything here is intentionally **out of scope for the MVP**. The MVP is detection-only: find unit-like expressions in the page and report them to the console. Nothing below should be started until that is finished.

## Conversion

- **Conversion engine.** Convert detected values into the user's preferred units. Pick a vetted units library (e.g. `convert-units`) instead of hand-rolling factors — the registry deliberately carries no conversion factors yet.
- **Conversion UI.** Inline replacement / tooltip / popover on detected ranges. The scanner already emits DOM `range` objects so the UI can anchor to exact text nodes.
- **Settings surface.** Target unit per category (e.g. always show `°C`, `km`, `kg`), plus per-site enable/disable.

## Coverage

- **Cross-frame scanning.** MVP scans the top frame's light DOM only. Add same-origin/all-frame scanning with `all_frames: true`.
- **Shadow DOM.** Traverse open shadow roots; closed roots stay unreachable by design.
- **Attribute text.** `title`, `alt`, `aria-label`, `placeholder`, `value` — currently ignored.
- **Inherited units (v2).** Resolve bare numbers against table headers, chart axes, and section headings (`Height (m)` → `5` means `5 m`).
- **Dynamic text containers.** Text inside `contenteditable` is skipped to avoid fighting the user; revisit if in-place editing needs highlighting.

## Parsing & inference

- **Locale-aware numbers.** `1.234,56` vs `1,234.56`, non-Latin digits, locale-specific group separators.
- **`±` tolerances.** `5 ± 0.2 kg` should yield a single range-like detection instead of dropping the tolerance.
- **`×` dimension inference.** `5 × 10 cm` should apply the trailing unit to the leading number.
- **More compounds.** Only `kg/m²` is registered today. Expand the curated compound set on demand (density, flow rate, torque-per-length, etc.).
- **Unit aliases in other languages.** Registry is English + SI/imperial symbols for v1. Add per-locale alias lists with stable unit IDs unchanged.

## Registry

- **Locale metadata.** Add `locale`/`name` fields per alias once localization starts.
- **Category growth.** Additional categories (e.g. illuminance, viscosity, radiation) as real pages demand them.

## Performance

- **Chunked initial scan.** The first pass is synchronous over every block element. Split it into idle-time chunks on large documents.
- **Smarter mutation handling.** Revisit debounce interval, added/removed subtree pruning, and whether `characterData` can be narrowed.
- **Avoid re-scanning unchanged blocks.** Cache per-block text hashes to skip no-op rescans.

## Testing & tooling

- **Vitest.** Unit tests for `number-parser`, `detect`, `confidence`, and `registry` invariants (unique IDs, no alias collisions).
- **DOM tests.** jsdom/happy-dom coverage for `scanElement` extraction, normalization source maps, and mutation lifecycle.
- **End-to-end smoke test.** Load the built extension against a fixture page and assert console output.
- **CI.** Typecheck, build, and tests on every push.

## Known limitations to document for users

- Detection is heuristic: `5 m` is `low` confidence because `m` is ambiguous.
- Only explicitly registered aliases match; unregistered compounds are reported as diagnostics, not guessed.
- Numbers inside skipped containers (`code`, `pre`, form controls, `contenteditable`) are never touched.
