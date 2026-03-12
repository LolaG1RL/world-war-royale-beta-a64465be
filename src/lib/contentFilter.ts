// Content safety filter for clan names, chat messages, usernames
const BANNED_WORDS = [
  'fuck','shit','ass','bitch','dick','cock','pussy','nigger','nigga','faggot','retard',
  'cunt','whore','slut','rape','kill yourself','kys','nazi','hitler','porn','sex',
  'damn','bastard','piss','bollocks','wanker','twat','arse',
];

const BANNED_PATTERNS = [
  /f+u+c+k+/i, /s+h+[i1]+t+/i, /b+[i1]+t+c+h+/i, /n+[i1]+g+/i, /d+[i1]+c+k+/i,
  /a+s+s+h+o+l+e+/i, /c+u+n+t+/i, /w+h+o+r+e+/i, /f+a+g+/i, /r+e+t+a+r+d+/i,
];

export function isContentSafe(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) return false;
  }
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) return false;
  }
  return true;
}

export function sanitizeContent(text: string): string {
  let result = text;
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, '***');
  }
  return result;
}
