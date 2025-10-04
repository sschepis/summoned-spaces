/**
 * JSON Parsing and Repair Utilities
 * Handles truncated/malformed JSON gracefully
 */

/**
 * Safely parse JSON with error handling
 */
export function tryParseJson<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Repair truncated or malformed JSON
 * Attempts to fix common truncation issues by closing brackets/braces
 */
export function repairTruncatedJson(json: string): string | null {
  const repairedJson = json.trim();
  
  // Handle incomplete objects by closing them
  if (repairedJson.endsWith('{') || repairedJson.endsWith('{"')) {
    console.warn('[JSON Repair] Skipping severely truncated JSON');
    return null;
  }
  
  // Try to close incomplete JSON objects/arrays
  let openBraces = 0;
  let openSquares = 0;
  
  for (const char of repairedJson) {
    if (char === '{') openBraces++;
    else if (char === '}') openBraces--;
    else if (char === '[') openSquares++;
    else if (char === ']') openSquares--;
  }
  
  // Close missing brackets
  let repaired = repairedJson;
  while (openSquares > 0) {
    repaired += ']';
    openSquares--;
  }
  while (openBraces > 0) {
    repaired += '}';
    openBraces--;
  }
  
  // Verify the repaired JSON is valid
  try {
    JSON.parse(repaired);
    return repaired;
  } catch {
    return null;
  }
}

/**
 * Extract JSON payload from text that may contain extra data
 * Removes null characters and extracts first valid JSON structure
 */
export function extractJsonPayload(raw: string): Record<string, unknown> | null {
  // Remove null characters from the string
  const nullChar = String.fromCharCode(0);
  const sanitized = raw.replace(new RegExp(nullChar, 'g'), '').trim();
  
  if (!sanitized) {
    return null;
  }

  // Try direct parsing first
  const directObject = tryParseJson<Record<string, unknown>>(sanitized);
  if (directObject && typeof directObject === 'object') {
    return directObject;
  }

  // Try to extract first JSON structure
  const fragment = extractFirstJsonStructure(sanitized);
  if (fragment) {
    const parsed = tryParseJson<Record<string, unknown>>(fragment);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  }

  // Try to repair and parse
  const repaired = repairTruncatedJson(sanitized);
  if (repaired) {
    const parsed = tryParseJson<Record<string, unknown>>(repaired);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  }

  return null;
}

/**
 * Extract the first JSON object or array from text
 */
function extractFirstJsonStructure(text: string): string | null {
  // Try object extraction first
  const objectFragment = extractDelimitedJson(text, '{', '}');
  if (objectFragment) {
    return objectFragment;
  }

  // Try array extraction
  return extractDelimitedJson(text, '[', ']');
}

/**
 * Extract delimited JSON (object or array) from text
 */
function extractDelimitedJson(
  text: string,
  open: '{' | '[',
  close: '}' | ']'
): string | null {
  const start = text.indexOf(open);
  if (start === -1) {
    return null;
  }

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (char === open) {
      depth++;
    } else if (char === close) {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

/**
 * Parse JSON with automatic repair attempt on failure
 */
export function parseJsonWithRepair<T = unknown>(text: string): T | null {
  // Try direct parsing first
  const direct = tryParseJson<T>(text);
  if (direct !== null) {
    return direct;
  }

  // Try extraction
  const extracted = extractJsonPayload(text);
  if (extracted) {
    return extracted as T;
  }

  // Try repair
  const repaired = repairTruncatedJson(text);
  if (repaired) {
    return tryParseJson<T>(repaired);
  }

  return null;
}