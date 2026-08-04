import { hasMeaningfulContent } from './prompt/meaningful.js';

export function safeProjectSlug(name: string): string {
  if (!hasMeaningfulContent(name)) return 'untitled-eel-effect';
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'untitled-eel-effect';
}

export function architectExportFilename(name: string): string {
  return `${safeProjectSlug(name)}-architect-handoff.md`;
}

export function projectExportFilename(name: string): string {
  return `${safeProjectSlug(name)}-eelforge-project.json`;
}
