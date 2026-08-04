import { describe, expect, it } from 'vitest';
import { verifySingleFile } from '../scripts/verify-single-file.mjs';

const valid = `<!doctype html>
<!-- EELFORGE:HANDOFF-HEADER:BEGIN --><!-- EELFORGE:HANDOFF-HEADER:END -->
<html><head>
<!-- EELFORGE:MANIFEST:BEGIN --><script type="application/json" id="eelforge-manifest">{}</script><!-- EELFORGE:MANIFEST:END -->
<style>body{margin:0}</style></head><body><div id="app"></div><script>console.log('ok')</script></body></html>`;

describe('single-file verifier', () => {
  it('accepts a self-contained artifact', () => expect(verifySingleFile(valid)).toEqual({ ok: true, errors: [] }));

  it('allows harmless XML namespace strings inside the application bundle', () => {
    const html = valid.replace("console.log('ok')", "const svgNamespace='http://www.w3.org/2000/svg'; console.log(svgNamespace)");
    expect(verifySingleFile(html)).toEqual({ ok: true, errors: [] });
  });

  it('does not count script-like text inside the executable script as another HTML element', () => {
    const html = valid.replace("console.log('ok')", "const example='<script src=\\\"example.js\\\"></script>'; console.log(example)");
    expect(verifySingleFile(html)).toEqual({ ok: true, errors: [] });
  });

  it.each([
    ['external scripts', valid.replace('<script>console', '<script src="x.js"></script><script>console')],
    ['external styles', valid.replace('<style>', '<link rel="stylesheet" href="x.css"><style>')],
    ['HTTP resources', valid.replace('body{', 'body{background:url(https://example.com/x.png);')],
    ['asset paths', valid.replace('body{', 'body{background:url(/assets/x.png);')],
    ['dynamic imports', valid.replace("console.log('ok')", "import('./x.js')")],
    ['service workers', valid.replace("console.log('ok')", "navigator.serviceWorker.register('sw.js')")],
  ])('rejects %s', (_label, html) => expect(verifySingleFile(html).ok).toBe(false));
});
