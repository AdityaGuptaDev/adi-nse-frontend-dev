export function generateUniqueId(): string {
    const now = new Date();

    // Format: YYYYMMDD
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');

    // Generate a 3-digit random number (or you could use a counter)
    const randomPart = Math.floor(100 + Math.random() * 900);

    // Combine parts
    const uniqueId = `${datePart}${randomPart}`;

    return uniqueId;
}