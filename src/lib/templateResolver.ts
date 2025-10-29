import type { ConstitutionData } from '../types/acronyms';
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Resolve a single ACRONYM token using the constitution data.
 * token example: 'User Story' (the part after ACRONYM:)
 */
export function resolveAcronymToken(name: string, constData?: ConstitutionData): string {
  const key = (name || '').trim();
  const acronyms = (constData && (constData.Acronyms as Record<string, string>)) || {};
  if (!key) return '';

  // Direct lookup (artifactType -> acronym)
  if (acronyms[key]) return acronyms[key];

  // Case-insensitive match on artifact type
  const found = Object.keys(acronyms).find(k => k.toLowerCase() === key.toLowerCase());
  if (found) return acronyms[found];

  // If the key itself looks like a short token (e.g., 'USR'), return it upper-cased
  if (/^[A-Za-z0-9_-]{1,10}$/.test(key)) return key.toUpperCase();

  // No acronym was found — caller can decide fallback strategy.
  return key;
}

/** Replace tokens like {{ACRONYM:User Story}} in a template string. */
export function resolveTemplate(template: string, constData?: ConstitutionData): string {
  if (!template) return template;
  return template.replace(/\{\{\s*ACRONYM\s*:\s*([^}]+?)\s*\}\}/g, (_m, p1) => {
    const key = p1.trim();
    const acronyms = (constData && (constData.Acronyms as Record<string,string>)) || undefined;
    // If there is a mapping object with at least one entry, prefer acronym or
    // initials fallback. If mapping is absent or empty, return the token text.
    if (acronyms && Object.keys(acronyms).length > 0) {
      if (acronyms[key]) return acronyms[key];
      const found = Object.keys(acronyms).find(k => k.toLowerCase() === key.toLowerCase());
      if (found) return acronyms[found];
      // build initials fallback
      const initials = key
        .split(/\s+/)
        .map((w: string) => (w.replace(/[^A-Za-z0-9]/g, '')[0] || '').toUpperCase())
        .join('')
        .slice(0, 3);
      return initials || key;
    }
    return key;
  });
}

/**
 * Replace tokens using a ConstitutionStore instance. This function will
 * consult the store for acronyms and fallback to initials when missing.
 */
export async function resolveAcronymsInText(text: string, store: any): Promise<string> {
  let mapping: Record<string, string> = {};
  if (store && typeof store.getAcronyms === 'function') {
    try {
      mapping = await store.getAcronyms();
    } catch (e) {
      void e;
      mapping = {};
    }
  }

  const tokenRe = /\{\{\s*ACRONYM\s*:\s*([^}]+?)\s*\}\}/gi;
  return text.replace(tokenRe, (_m, name) => {
    const key = name.trim();
    if (mapping[key]) return mapping[key];
    // build initials fallback (max 3 letters)
    const initials = key
      .split(/\s+/)
      .map((w: string) => (w.replace(/[^A-Za-z0-9]/g, '')[0] || '').toUpperCase())
      .join('')
      .slice(0, 3);
    return initials || key;
  });
}

export async function resolveTemplateFromFile(filePath: string, constData?: ConstitutionData): Promise<string> {
  const text = await readFile(path.resolve(filePath), 'utf8');
  return resolveTemplate(text, constData);
}

export default { resolveTemplate, resolveTemplateFromFile, resolveAcronymToken };
