import { describe, expect, it } from 'vitest';
import * as utils from '../scripts/single-file-utils.mjs';
import { replaceOnceLiteral } from '../scripts/single-file-utils.mjs';

describe('single-file literal insertion', () => {
  it('normalizes mixed line endings to LF for deterministic artifacts', () => {
    expect(utils.normalizeLineEndings).toBeTypeOf('function');
    expect(utils.normalizeLineEndings('a\r\nb\rc\nd')).toBe('a\nb\nc\nd');
  });

  it('removes orphan CR residue from Vite-built HTML', () => {
    expect(utils.normalizeBuiltHtml).toBeTypeOf('function');
    expect(utils.normalizeBuiltHtml('<div id="app"></div>\r\r\n  </body>\r\n')).toBe('<div id="app"></div>\n  </body>\n');
  });

  it('preserves JavaScript replacement tokens verbatim', () => {
    const bundle = '<script>const tokens = "$& $` $\'";</script>\n</body>';
    const result = replaceOnceLiteral('<html><body></body></html>', '</body>', bundle);
    expect(result).toBe('<html><body><script>const tokens = "$& $` $\'";</script>\n</body></html>');
  });

  it('fails when a required marker is absent', () => {
    expect(() => replaceOnceLiteral('<html></html>', '</body>', 'x')).toThrow('Required HTML marker was not found');
  });
});
