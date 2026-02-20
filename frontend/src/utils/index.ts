/**
 * Frontend utilities - shared helper functions
 */

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function isImageValid(file: File, maxSize: number): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  return validTypes.includes(file.type) && file.size <= maxSize;
}

/** Format a commodity price with currency prefix and smart precision. */
export function formatPrice(price: number, currency: string): string {
  if (price >= 1000) return `${currency} ${(price / 1000).toFixed(1)}k`;
  if (price < 1) return `${currency} ${price.toFixed(3)}`;
  return `${currency} ${price.toFixed(2)}`;
}

/** UUID v4 generator for browser environments (crypto.randomUUID when available). */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
