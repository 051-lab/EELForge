import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifySingleFile } from './verify-single-file.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const release = JSON.parse(await readFile(path.join(root, 'release.json'), 'utf8'));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (release.version !== pkg.version) throw new Error(`release.json version ${release.version} disagrees with package.json ${pkg.version}.`);
if (release.schemaVersion !== 3) throw new Error('Portable release metadata must use schema version 3.');

const dist = path.join(root, 'dist');
const official = path.join(root, 'releases', release.artifactName);
const temporary = `${official}.tmp`;

function assetPath(reference) {
  const cleaned = reference.replace(/^\.\//, '').replace(/^\//, '');
  return path.join(dist, cleaned);
}

try {
  let html = await readFile(path.join(dist, 'index.html'), 'utf8');
  const scriptMatches = [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi)];
  const cssMatches = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  if (scriptMatches.length !== 1) throw new Error(`Expected one built JavaScript asset, found ${scriptMatches.length}.`);
  if (cssMatches.length > 1) throw new Error(`Expected at most one built CSS asset, found ${cssMatches.length}.`);

  const scriptTag = scriptMatches[0][0];
  const script = await readFile(assetPath(scriptMatches[0][1]), 'utf8');
  html = html.replace(scriptTag, '');

  let css = '';
  if (cssMatches.length === 1) {
    css = await readFile(assetPath(cssMatches[0][1]), 'utf8');
    html = html.replace(cssMatches[0][0], '');
  }

  const header = await readFile(path.join(root, 'handoff', 'agent-handoff-header.html'), 'utf8');
  const manifest = `<!-- EELFORGE:MANIFEST:BEGIN -->\n<script type="application/json" id="eelforge-manifest">${JSON.stringify(release, null, 2).replace(/<\//g, '<\\/')}</script>\n<!-- EELFORGE:MANIFEST:END -->`;
  const style = `<style>\n${css}\n</style>`;
  const executable = `<script>\n${script.replace(/<\//g, '<\\/')}\n</script>`;

  html = html.replace(/<!doctype html>/i, `<!doctype html>\n${header.trim()}`);
  html = html.replace('</head>', `${manifest}\n${style}\n</head>`);
  html = html.replace('</body>', `${executable}\n</body>`);

  const verification = verifySingleFile(html);
  if (!verification.ok) throw new Error(`Single-file verification failed:\n${verification.errors.join('\n')}`);
  await writeFile(temporary, html, 'utf8');
  await rename(temporary, official);
  console.log(`Published ${path.relative(root, official)} (${Buffer.byteLength(html)} bytes).`);
} catch (error) {
  await rm(temporary, { force: true });
  throw error;
}
