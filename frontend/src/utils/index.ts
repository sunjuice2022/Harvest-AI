/**
 * Frontend utilities - helper functions
 */

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function isImageValid(file: File, maxSize: number): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  return validTypes.includes(file.type) && file.size <= maxSize;
}
