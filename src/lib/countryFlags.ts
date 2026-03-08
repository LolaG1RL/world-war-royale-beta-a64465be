// Convert ISO 3166-1 alpha-2 country code to flag emoji
export function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '🏳️';
  const codePoints = [...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
