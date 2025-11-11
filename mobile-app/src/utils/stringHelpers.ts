/**
 * String Helper Utilities
 * Safe string operations for handling undefined/null values
 */

/**
 * Safely get first character of a string
 * @param str String to get first character from
 * @param fallback Fallback character if string is empty/null/undefined (default: '?')
 * @returns First character in uppercase or fallback
 */
export function getFirstChar(str: string | null | undefined, fallback: string = '?'): string {
  if (!str || typeof str !== 'string' || str.length === 0) {
    return fallback.toUpperCase();
  }
  return str.charAt(0).toUpperCase();
}

/**
 * Safely capitalize first letter of a string
 * @param str String to capitalize
 * @param fallback Fallback string if input is empty/null/undefined
 * @returns Capitalized string or fallback
 */
export function capitalize(str: string | null | undefined, fallback: string = ''): string {
  if (!str || typeof str !== 'string' || str.length === 0) {
    return fallback;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Safely get substring of a string
 * @param str String to get substring from
 * @param start Start index
 * @param end End index (optional)
 * @param fallback Fallback string if input is invalid
 * @returns Substring or fallback
 */
export function safeSubstring(
  str: string | null | undefined,
  start: number,
  end?: number,
  fallback: string = ''
): string {
  if (!str || typeof str !== 'string') {
    return fallback;
  }
  try {
    return end !== undefined ? str.substring(start, end) : str.substring(start);
  } catch {
    return fallback;
  }
}

/**
 * Safely check if string is empty
 * @param str String to check
 * @returns True if string is empty, null, undefined, or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || typeof str !== 'string' || str.trim().length === 0;
}








