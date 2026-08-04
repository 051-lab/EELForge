import { describe, expect, it } from 'vitest';
import { replaceOnceLiteral } from '../scripts/single-file-utils.mjs';

describe('single-file literal insertion', () => {
  it('preserves JavaScript replacement tokens verbatim', () => {
    const bundle = '<script>const tokens = "$& $` $\'";</script>\n</body>';
    const result = replaceOnceLiteral('<html><body></body></html>', '</body>', bundle);
    expect(result).toBe('<html><body><script>const tokens = "$& $` $\'";</script>\n</body></html>');
  });

  it('fails when a required marker is absent', () => {
    expect(() => replaceOnceLiteral('<html></html>', '</body>', 'x')).toThrow('Required HTML marker was not found');
  });
});
