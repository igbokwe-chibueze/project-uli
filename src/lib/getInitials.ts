// src/lib/getInitials.ts


/**
 * Extracts up to two initials from one or more name strings:
 *  - Accepts one string (full name) or multiple strings (e.g., first name, last name).
 *  - Ignores empty, null, or undefined parts automatically.
 *  - If there are ≥2 words, takes the first letter of the first & last words.
 *  - Otherwise, takes the first two letters of the single word.
 *  - Falls back to "??" if no letters are found.
 * 
 * Examples:
 *  - getInitials("Chibueze Igbokwe")         → "CI"
 *  - getInitials("Chibueze", "Igbokwe")     → "CI"
 *  - getInitials("Chibueze")                 → "CH"
 *  - getInitials("  单   名  ")              → Unicode initials
 *  - getInitials("")                        → "??"
 *  - getInitials(undefined, "Igbokwe")      → "IG"
 */
export const getInitials = (...nameParts: (string | null | undefined)[]) => {
    // Join all non-empty strings into one
    const fullName = nameParts
        .filter((part) => typeof part === "string" && part.trim().length > 0)
        .join(" ")
        .trim();

    if (!fullName) return "??";

    // Find all letter boundaries (Unicode aware)
    // \b\p{L} means “word‐boundary + a Unicode letter”
    const letters = fullName.match(/\b\p{L}/gu) || [];

    if (letters.length >= 2) {
        // First + last letter found
        return (letters[0] + letters[letters.length - 1]).toUpperCase();
    }
    if (letters.length === 1) {
        // charAt(1) might be a combining mark or space—so we default to '?' if not a letter
        const second = fullName.charAt(1).match(/\p{L}/u)?.[0] ?? "?";
        return (letters[0] + second).toUpperCase();
    }
    // No letters at all
    return "??";
};

