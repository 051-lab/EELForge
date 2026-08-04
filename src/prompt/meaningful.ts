const PUNCTUATION_ONLY = /[\s.\-–—_,;:!?()[\]{}'"`~@#$%^&*+=|\\/<>]+/g;

export function hasMeaningfulContent(value: string): boolean {
  return value.replace(PUNCTUATION_ONLY, '').trim().length >= 2;
}

export function meaningfulValue(value: string): string | null {
  const trimmed = value.trim();
  return hasMeaningfulContent(trimmed) ? trimmed : null;
}
