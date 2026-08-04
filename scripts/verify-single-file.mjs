import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const REQUIRED_MARKERS = [
  'EELFORGE:HANDOFF-HEADER:BEGIN',
  'EELFORGE:HANDOFF-HEADER:END',
  'EELFORGE:MANIFEST:BEGIN',
  'EELFORGE:MANIFEST:END',
  'id="eelforge-manifest"',
  'id="app"',
];

export function verifySingleFile(html) {
  const errors = [];
  for (const marker of REQUIRED_MARKERS) {
    if (!html.includes(marker)) errors.push(`Missing required marker: ${marker}`);
  }
  const forbidden = [
    [/<script\b[^>]*\bsrc\s*=/i, 'external script source'],
    [/<link\b[^>]*rel=["']?stylesheet["']?[^>]*href\s*=/i, 'external stylesheet'],
    [/\bhttps?:\/\//i, 'HTTP resource'],
    [/\bsrc\s*=\s*["']\/\//i, 'protocol-relative resource'],
    [/\b(?:src|href)\s*=\s*["']\/assets\//i, 'unresolved /assets/ path'],
    [/\bimport\s*\(/, 'dynamic import'],
    [/serviceWorker\s*\./i, 'service worker'],
    [/<script\b[^>]*type=["']module["']/i, 'module script'],
  ];
  for (const [pattern, label] of forbidden) {
    if (pattern.test(html)) errors.push(`Found forbidden ${label}.`);
  }
  const scripts = html.match(/<script\b(?![^>]*type=["']application\/json["'])[^>]*>/gi) ?? [];
  if (scripts.length !== 1) errors.push(`Expected exactly one executable script, found ${scripts.length}.`);
  const styles = html.match(/<style\b[^>]*>/gi) ?? [];
  if (styles.length !== 1) errors.push(`Expected exactly one inline style block, found ${styles.length}.`);
  return { ok: errors.length === 0, errors };
}

async function main() {
  const filename = process.argv[2];
  if (!filename) throw new Error('Usage: node scripts/verify-single-file.mjs <html-file>');
  const html = await readFile(filename, 'utf8');
  const result = verifySingleFile(html);
  if (!result.ok) {
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Verified ${filename} (${Buffer.byteLength(html)} bytes).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
