import { promises as fs } from 'fs';
import path from 'path';
import { UpdateAcronymsResult } from '../types/acronyms';
import { readConstitution } from './constitution';

export async function listFiles(root: string): Promise<string[]> {
  const results: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === '.git' || e.name === 'node_modules' || e.name === '.specify') continue;
        await walk(full);
      } else if (e.isFile()) {
        if (/\.(md|mdx|txt|markdown|yml|yaml)$/i.test(e.name)) results.push(full);
      }
    }
  }
  await walk(path.resolve(root));
  return results;
}

export async function scanForAcronymTokens(targetDir = process.cwd()): Promise<Array<{ file: string; replacements: number }>> {
  const files = await listFiles(targetDir);
  const constData = await readConstitution().catch(() => ({} as any));
  const tokenRe = /{{\s*ACRONYM\s*:\s*([^}]+?)\s*}}/g;
  const summary: Array<{ file: string; replacements: number }> = [];
  for (const f of files) {
    try {
      const txt = await fs.readFile(f, 'utf8');
      let m: RegExpExecArray | null;
      let count = 0;
      tokenRe.lastIndex = 0;
      while ((m = tokenRe.exec(txt)) !== null) {
        const key = m[1].trim();
        if (constData && constData.Acronyms && (constData.Acronyms[key] || Object.keys(constData.Acronyms).find(k => k.toLowerCase() === key.toLowerCase()))) {
          count++;
        }
      }
      if (count > 0) summary.push({ file: path.resolve(f), replacements: count });
    } catch (e) {
      void e;
      // ignore unreadable files
    }
  }
  return summary;
}

export async function generateDryRunJson(targetDir = process.cwd(), outPath?: string) {
  const summaries = await scanForAcronymTokens(targetDir);
  const result: UpdateAcronymsResult = {
    changedFiles: summaries.map(s => s.file),
    summary: summaries.map(s => ({ file: s.file, replacements: s.replacements })),
    branch: undefined,
    commitHash: undefined,
  } as any;
  if (outPath) {
    const d = path.dirname(outPath);
    await fs.mkdir(d, { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(result, null, 2), 'utf8');
  }
  return result;
}

export async function applyReplacements(targetDir = process.cwd()): Promise<UpdateAcronymsResult> {
  const summaries = await scanForAcronymTokens(targetDir);
  const constData = await readConstitution().catch(() => ({} as any));
  const acronyms = (constData && (constData.Acronyms || {})) || {};
  const tokenRe = /{{\s*ACRONYM\s*:\s*([^}]+?)\s*}}/g;
  const changedFiles: string[] = [];
  const summary: Array<{ file: string; replacements: number }> = [];
  for (const s of summaries) {
    try {
      let txt = await fs.readFile(s.file, 'utf8');
      let count = 0;
      txt = txt.replace(tokenRe, (_m, p1) => {
        const key = p1.trim();
        const val = acronyms[key] || acronyms[key.toLowerCase()] || acronyms[key.replace(/\s+/g, '')];
        count += 1;
        return val ?? _m;
      });
      if (count > 0) {
        await fs.writeFile(s.file, txt, 'utf8');
        changedFiles.push(path.resolve(s.file));
        summary.push({ file: path.resolve(s.file), replacements: count });
      }
    } catch (e) {
      void e;
      // ignore
    }
  }
  const result: UpdateAcronymsResult = { changedFiles, summary, branch: undefined, commitHash: undefined } as any;
  return result;
}

export default { listFiles, scanForAcronymTokens, generateDryRunJson, applyReplacements };
