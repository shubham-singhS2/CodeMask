import { PATTERNS } from './patterns';

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Sanitize code: detect secrets → register placeholders → replace in text.
 */
export function sanitize(code, registry, counters) {
  const lookup = new Map(registry.map(r => [r.realValue, r]));
  let newFinds = 0;

  // Normalise a copy for detection only.
  // Some languages (Python, JS) split long strings across lines:
  //   "postgresql://user:pass!"   <newline>   "@host/db"
  // Collapse those so connection-string patterns can match across the split.
  const normalised = code
    .replace(/["']\s*\n\s*["']@/g, '@')   // "pass!"\n    "@host" → pass!@host
    .replace(/["']\s*\\\n\s*["']/g, '');  // JS line-continuation strings

  const scanTarget = normalised;

  for (const pattern of PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let m;
    while ((m = regex.exec(scanTarget)) !== null) {
      const secret = pattern.extract(m);
      if (!secret || secret.trim().length < 4) continue;
      if (pattern.skip?.(secret)) continue;
      if (lookup.has(secret)) continue;

      counters[pattern.type]++;
      const ph = `{{${pattern.label}_${counters[pattern.type]}}}`;
      const entry = {
        id: generateId(),
        placeholder: ph,
        realValue: secret,
        type: pattern.type,
        patternName: pattern.name,
        count: 0,
        addedAt: Date.now(),
      };
      registry.push(entry);
      lookup.set(secret, entry);
      newFinds++;
    }
  }

  // Replace in the ORIGINAL code (not the normalised copy).
  // Sort longest real value first to avoid partial-match collisions.
  let output = code;
  const sorted = [...registry].sort((a, b) => b.realValue.length - a.realValue.length);

  for (const entry of sorted) {
    const esc = escapeRegex(entry.realValue);
    const rx = new RegExp(esc, 'g');
    const matches = output.match(rx);
    if (matches) {
      entry.count += matches.length;
      output = output.replace(rx, entry.placeholder);
    }
  }

  return { output, newFinds };
}

/**
 * Restore code: swap placeholders back to real values.
 */
export function restore(code, registry) {
  let output = code;
  let restored = 0;

  // Longest placeholder first to avoid prefix collisions ({{IP_1}} vs {{IP_10}})
  const sorted = [...registry].sort((a, b) => b.placeholder.length - a.placeholder.length);
  for (const entry of sorted) {
    const esc = escapeRegex(entry.placeholder);
    const rx = new RegExp(esc, 'g');
    if (rx.test(output)) {
      output = output.replace(new RegExp(esc, 'g'), entry.realValue);
      restored++;
    }
  }

  return { output, restored };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
