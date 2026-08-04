export interface PortableCrypto {
  randomUUID?: () => string;
  getRandomValues?: (array: Uint8Array) => Uint8Array;
}

function hex(value: number): string {
  return value.toString(16).padStart(2, '0');
}

export function createPortableUuid(
  source: PortableCrypto | undefined = typeof globalThis.crypto === 'undefined' ? undefined : globalThis.crypto,
  fallbackRandom: () => number = Math.random,
): string {
  const bytes = new Uint8Array(16);
  if (source?.getRandomValues) {
    source.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(fallbackRandom() * 256) & 0xff;
    }
  }

  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const encoded = [...bytes].map(hex);
  return `${encoded.slice(0, 4).join('')}-${encoded.slice(4, 6).join('')}-${encoded.slice(6, 8).join('')}-${encoded.slice(8, 10).join('')}-${encoded.slice(10).join('')}`;
}

export function installRandomUuidFallback(
  source: PortableCrypto | undefined = typeof globalThis.crypto === 'undefined' ? undefined : globalThis.crypto,
): boolean {
  if (!source || typeof source.randomUUID === 'function') return false;
  const fallback = () => createPortableUuid(source);
  try {
    Object.defineProperty(source, 'randomUUID', {
      configurable: true,
      value: fallback,
    });
    return typeof source.randomUUID === 'function';
  } catch {
    return false;
  }
}
