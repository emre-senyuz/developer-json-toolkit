export const MAX_INPUT = 100_000;
export const MAX_DEPTH = 100;
export const MAX_OUTPUT = 1_000_000;
export type Stats = { type: string; depth: number; keys: number | null };

// Scan structural depth without recursion; braces inside strings do not count.
export function depthOf(text: string): number {
  let depth = 0, maximum = 0, quoted = false, escaped = false;
  for (const char of text) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '{' || char === '[') maximum = Math.max(maximum, ++depth);
    else if (char === '}' || char === ']') depth--;
  }
  return maximum;
}

export function parse(text: string): { value: unknown; stats: Stats } {
  if (text.length > MAX_INPUT) throw new Error('Input exceeds the 100,000-character limit. Use a smaller document.');
  if (!text.trim()) throw new Error('Add some JSON first. Objects, arrays, strings, numbers, booleans and null are all supported.');
  const depth = depthOf(text);
  if (depth > MAX_DEPTH) throw new Error('This document exceeds the maximum nesting depth of 100. Reduce its nesting before processing.');
  let value: unknown;
  try { value = JSON.parse(text) as unknown; }
  catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'The browser could not parse this JSON.';
    const position = /position\s+(\d+)/i.exec(detail);
    let location = '';
    if (position) {
      const offset = Number(position[1]);
      const prefix = text.slice(0, offset);
      const line = prefix.split(/\r\n|\r|\n/).length;
      location = ` Near character ${offset + 1} (approximately line ${line}).`;
    }
    throw new Error(`Invalid JSON.${location} Check double-quoted keys and strings, commas, and matching brackets. Browser detail: ${detail}`);
  }
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  return { value, stats: { type, depth, keys: type === 'object' ? Object.keys(value as object).length : null } };
}
