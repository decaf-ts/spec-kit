#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';

async function walk(dir: string, filesSet: Set<string>) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const name = e.name;
    if (name === 'node_modules' || name === '.git' || name === '.specify') continue;
    const full = path.join(dir, name);
    if (e.isDirectory()) {
      await walk(full, filesSet);
    } else if (e.isFile()) {
      if (/\.(md|mdx|txt|markdown)$/i.test(name)) filesSet.add(full);
    }
  }
}

async function scanAndWrite(target: string, outPath: string): Promise<{ changedFiles: string[]; summary: Array<{ file: string; replacements: number }>; timestamp: string }> {
  const files = new Set<string>();
  await walk(target, files);
  // try to read constitution from target
  let acronyms: Record<string, string> = {};
  try {
    const consPath = path.join(target, '.specify', 'memory', 'constitution.md');
    if (fsSync.existsSync(consPath)) {
      const raw = await fs.readFile(consPath, 'utf8');
      const m = raw.match(/```(?:yaml|yml)\s*\n([\s\S]*?)\n```/i);
      const inner = m ? m[1].trim() : raw.trim();
      try { acronyms = JSON.parse(inner).Acronyms || {}; } catch (e) {
        void e; // Silence unused catch parameter
        // naive parse: look for lines '  Key: VAL'
        const lines = inner.split(/\r?\n/);
        for (const l of lines) {
          const kv = l.match(/^\s*([^:]+):\s*(\S+)\s*$/);
          if (kv) acronyms[kv[1].trim()] = kv[2].trim();
        }
      }
    }
  } catch (e) {
    void e; // Silence unused catch parameter
    acronyms = {};
  }

  const tokenRe = /\{\{\s*ACRONYM\s*:\s*([^}]+?)\s*\}\}/g;
  const summary = [];
  const changedFiles = [];

  for (const f of files) {
    try {
      const txt = await fs.readFile(f, 'utf8');
      let m; let count = 0; tokenRe.lastIndex = 0;
      while ((m = tokenRe.exec(txt)) !== null) {
        const key = m[1].trim();
        if (acronyms && (acronyms[key] || Object.keys(acronyms).find(k => k.toLowerCase() === key.toLowerCase()))) count++;
      }
      if (count > 0) {
        summary.push({ file: path.resolve(f), replacements: count });
        changedFiles.push(path.resolve(f));
      }
    } catch (e) {
      void e;
    }
  }

  const result = { changedFiles, summary, timestamp: new Date().toISOString() };
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(result, null, 2), 'utf8');
  return result;
}

export async function runUpdateAcronymsCLI(argv: string[] = process.argv.slice(2)) {
  const targetArg = argv.find(a => a.startsWith('--target='));
  const target = (targetArg ? targetArg.split('=')[1] : process.cwd()) as string;
  const out = path.resolve('specs/001-configurable-acronyms-jira-integration');
  const outPath = path.join(out, 'update-acronyms-dryrun.json');
  const result = await scanAndWrite(target, outPath);

  // If apply flag present, perform replacements in the target repo, create branch and commit
  if (argv.includes('--apply')) {
    const branchArg = argv.find(a => a.startsWith('--branch='));
    const branch = branchArg ? branchArg.split('=')[1] : `chore/update-acronyms-${Date.now()}`;
    // read constitution mapping again
    const consPath = path.join(target, '.specify', 'memory', 'constitution.md');
    let acronyms: Record<string, string> = {};
    try {
      const raw = await fs.readFile(consPath, 'utf8');
      const m = raw.match(/```(?:yaml|yml)\s*\n([\s\S]*?)\n```/i);
      const inner = m ? m[1].trim() : raw.trim();
      try { acronyms = (JSON.parse(inner) as any).Acronyms || {}; } catch (e) { void e;
          const lines = inner.split(/\r?\n/);
        for (const l of lines) {
          const kv = l.match(/^\s*([^:]+):\s*(\S+)\s*$/);
          if (kv) (acronyms as any)[kv[1].trim()] = kv[2].trim();
        }
      }
    } catch (e) {
      void e;
      acronyms = {};
    }

    // perform replacements
    const tokenRe = /\{\{\s*ACRONYM\s*:\s*([^}]+?)\s*\}\}/g;
    for (const item of result.summary as Array<{ file: string; replacements: number }>) {
      try {
        const filePath = item.file;
        let txt = await fs.readFile(filePath, 'utf8');
        txt = txt.replace(tokenRe, (_m, p1) => {
          const key = p1.trim();
          const found = Object.keys(acronyms).find(k => k.toLowerCase() === key.toLowerCase());
          if (found) return acronyms[found];
          if (acronyms[key]) return acronyms[key];
          // fallback to initials
          const initials = key.split(/\s+/).map((w: string) => (w.replace(/[^A-Za-z0-9]/g,'')[0]||'').toUpperCase()).join('').slice(0,3);
          return initials || key;
        });
        await fs.writeFile(filePath, txt, 'utf8');
      } catch (e) {
          void e; // Silence unused catch parameter
          // ignore per-file failures
      }
    }

    // create branch and commit inside target repo using git CLI
    let commitHash = '';
    try {
  const { execSync } = await import('child_process');
      execSync(`git checkout -b ${branch}`, { cwd: target, stdio: 'ignore' });
      execSync('git add -A', { cwd: target, stdio: 'ignore' });
      execSync(`git commit -m "chore: apply acronym replacements"`, { cwd: target, stdio: 'ignore' });
      commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8', cwd: target }).trim();
    } catch (e) {
      void e; // Silence unused catch parameter
      // git may fail (no git available etc.) — continue and write partial result
      commitHash = '';
    }

    const outApply = path.join(out, 'update-acronyms-result.json');
    await fs.writeFile(outApply, JSON.stringify({ ...result, branch, commitHash }, null, 2), 'utf8');
  }

  return outPath;
}

import { fileURLToPath } from 'url';
const __filename = (() => {
  try {
  // Access import.meta.url dynamically to avoid TypeScript errors when compiling to CommonJS
  const url = Function('return import.meta.url')();
    return fileURLToPath(url as string);
  } catch {
    // CommonJS fallback
    return process.argv[1];
  }
})();

if (process.argv[1] === __filename) {
  runUpdateAcronymsCLI(process.argv.slice(2)).then(p => console.log('Wrote', p)).catch(err => { console.error(err); process.exit(1); });
}

export default runUpdateAcronymsCLI;
