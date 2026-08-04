import { describe, expect, it, vi } from 'vitest';
import { createPortableUuid, installRandomUuidFallback, type PortableCrypto } from '../src/runtime-compat';

describe('portable UUID compatibility', () => {
  it('creates an RFC 4122 version-4-shaped ID from getRandomValues', () => {
    const source: PortableCrypto = {
      getRandomValues(array) {
        array.fill(0);
        return array;
      },
    };
    expect(createPortableUuid(source)).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('installs a fallback without replacing an existing randomUUID implementation', () => {
    const source: PortableCrypto = {
      getRandomValues(array) {
        array.fill(1);
        return array;
      },
    };
    expect(installRandomUuidFallback(source)).toBe(true);
    expect(source.randomUUID?.()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

    const existing = vi.fn(() => 'existing-id');
    const supported: PortableCrypto = { randomUUID: existing };
    expect(installRandomUuidFallback(supported)).toBe(false);
    expect(supported.randomUUID?.()).toBe('existing-id');
    expect(existing).toHaveBeenCalledOnce();
  });
});
