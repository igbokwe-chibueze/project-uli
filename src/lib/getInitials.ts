// src/lib/getInitials.ts

/**
 * Extracts up to two initials from a name string:
 *  - If there are ≥2 words, takes the first letter of the first & last words.
 *  - Otherwise, takes the first two letters of the single word.
 *  - Falls back to "??" if no letters are found.
 * Examples
 *  - console.log(getInitials("Chibueze Igbokwe")); // → "CI"
 *  - console.log(getInitials("Madonna"));          // → "MA"
 *  - console.log(getInitials("  单   名  "));       // → picks Unicode initials
 *  - console.log(getInitials(""));                 // → "??"
 * 
 *  - {getInitials(user.firstName + " " + user.lastName)}; // → "CI"
 *  
 */
export const getInitials = (fullName: string = '') => {
    // Find all letter boundaries (Unicode aware) in the string
    // \b\p{L} means “word‐boundary + a Unicode letter”
    const letters = fullName
        .trim()
        .match(/\b\p{L}/gu)  // e.g. "John Doe" → ["J","D"], "Álvaro" → ["Á"]
        || [];

    if (letters.length >= 2) {
        // First + last letter found
        return (letters[0] + letters[letters.length - 1]).toUpperCase();
    }
    if (letters.length === 1) {
        // Only one letter boundary, so grab next character from the trimmed string
        const trimmed = fullName.trim();
        // charAt(1) might be a combining mark or space—so we default to '?' if not a letter
        const second = trimmed.charAt(1).match(/\p{L}/u)?.[0] ?? '?';
        return (letters[0] + second).toUpperCase();
    }
    // No letters at all
    return '??';
}
