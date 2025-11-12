/**
 * String utility functions for text transformations
 */

/**
 * Converts a string to sentence case (first letter uppercase, rest lowercase)
 * @param text - The string to convert
 * @returns Sentence case string (e.g., "JOHN" -> "John")
 */
export function toSentenceCase(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Trim whitespace and convert to lowercase
  const trimmed = text.trim().toLowerCase();

  if (trimmed.length === 0) {
    return '';
  }

  // Capitalize first letter, keep rest lowercase
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Converts multiple names to sentence case
 * Useful for processing full names with multiple parts
 * @param names - Array of name strings
 * @returns Array of sentence case names
 */
export function namesToSentenceCase(...names: (string | null | undefined)[]): string[] {
  return names.map((name) => toSentenceCase(name));
}
