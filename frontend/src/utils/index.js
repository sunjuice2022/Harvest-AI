/**
 * Frontend utilities - helper functions
 */
export function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}
export function isImageValid(file, maxSize) {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    return validTypes.includes(file.type) && file.size <= maxSize;
}
//# sourceMappingURL=index.js.map