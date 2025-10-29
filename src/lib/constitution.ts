import { promises as fs } from 'fs';
import path from 'path';
import type { AcronymMap, ConstitutionData } from '../types/acronyms';

const DEFAULT_MARKERS = {
  start: '<!-- ACRONYMS-START -->',
  end: '<!-- ACRONYMS-END -->',
};

export async function readConstitutionFile(filePath?: string): Promise<string> {
  const p = filePath || path.resolve('.specify/memory/constitution.md');
  return fs.readFile(p, 'utf8');
}

export function extractAcronymsBlock(content: string): { block: string | null; before: string; after: string } {
  const startIdx = content.indexOf(DEFAULT_MARKERS.start);
  const endIdx = content.indexOf(DEFAULT_MARKERS.end);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return { block: null, before: content, after: '' };
  }
  const block = content.slice(startIdx + DEFAULT_MARKERS.start.length, endIdx).trim();
  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx + DEFAULT_MARKERS.end.length);
  return { block, before, after };
}

export function buildAcronymsBlock(obj: ConstitutionData): string {
  const acr = obj.Acronyms || {};
  const branch = obj.BranchConfig || {};
  const jira = obj.JiraMapping || {};
  const mcp = typeof obj.decafMcpEnabled === 'boolean' ? obj.decafMcpEnabled : true;

  const lines = [
    DEFAULT_MARKERS.start,
    '```yaml',
    'Acronyms:',
    ...Object.entries(acr).map(([k, v]) => `  "${k}": "${v}"`),
    'BranchConfig:',
    ...Object.entries(branch).map(([k, v]) => `  ${k}: "${String((v as any) ?? '')}"`),
    'JiraMapping:',
    ...Object.entries(jira).map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`),
    `decafMcpEnabled: ${mcp}`,
    '```',
    DEFAULT_MARKERS.end,
    '',
  ];
  return lines.join('\n');
}

export async function ensureAcronymsBlock(defaults: ConstitutionData = {} as any, filePath?: string): Promise<void> {
  const p = filePath || path.resolve('.specify/memory/constitution.md');
  let content = '';
  try {
    content = await fs.readFile(p, 'utf8');
  } catch (err) {
    void err; // create file if missing
    content = '# Project Constitution\n\n';
  }
  const { block, after } = extractAcronymsBlock(content);
  if (block) {
    // already present; no-op
    return;
  }
  // If there's already a YAML fence with an Acronyms section, prefer those
  // values as defaults so we don't overwrite existing mappings with an
  // empty new block.
  if (!block) {
    const yamlRe = /```(?:yaml|yml)\s*\n([\s\S]*?)\n```/m;
    const m = content.match(yamlRe);
    if (m && /Acronyms\s*:/i.test(m[1])) {
      // parse simple yaml-ish block (only the shapes we expect)
      const parsed: any = {};
      const lines = m[1].split(/\r?\n/).map(l => l.replace(/^\s+/, ''));
      let current: any = parsed;
      for (const line of lines) {
        if (!line || line.trim().startsWith('#')) continue;
        const kv = line.match(/^([^:]+):(.*)?$/);
        if (!kv) continue;
        const key = kv[1].trim();
        const val = kv[2] === undefined ? null : kv[2].trim();
        if (val === '' || val === null) {
          current[key] = {};
          current = current[key];
        } else {
          const unq = val.replace(/^"|"$/g, '');
          current[key] = unq === 'true' ? true : unq === 'false' ? false : unq;
        }
      }
      // copy recognized keys into defaults
      if (parsed.Acronyms) defaults.Acronyms = { ...(defaults.Acronyms || {}), ...(parsed.Acronyms || {}) };
      if (parsed.BranchConfig) defaults.BranchConfig = { ...(defaults.BranchConfig || {}), ...(parsed.BranchConfig || {}) };
      if (parsed.JiraMapping) defaults.JiraMapping = { ...(defaults.JiraMapping || {}), ...(parsed.JiraMapping || {}) };
      if (typeof parsed.decafMcpEnabled !== 'undefined') defaults.decafMcpEnabled = parsed.decafMcpEnabled;
    }
  }
  const newBlock = buildAcronymsBlock(defaults);
  const newContent = `${content}\n${newBlock}\n${after}`;
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, newContent, 'utf8');
  // Also write a JSON snapshot for tooling/tests that prefer a JSON file
  try {
    const snapshotPath = path.resolve('.specify', 'memory', 'constitution.json');
    const snap: any = {
      Acronyms: (defaults && defaults.Acronyms) || {},
      BranchConfig: (defaults && defaults.BranchConfig) || {},
      JiraMapping: (defaults && defaults.JiraMapping) || {},
      decafMcpEnabled: typeof (defaults && defaults.decafMcpEnabled) === 'boolean' ? defaults.decafMcpEnabled : true,
    };
    await fs.writeFile(snapshotPath, JSON.stringify(snap, null, 2), 'utf8');
    } catch (e) {
      void e; // ignore snapshot errors
  }
  // Per constitution policy, ensure @decaf-ts/mcp-server is installed when we
  // initialize the constitution for the first time. This attempts a dynamic
  // import and, if not resolvable, runs `npm install` to fetch the latest
  // package. This is a low-risk, optional convenience for initial project
  // setup. Do NOT attempt to auto-install while running unit tests (NODE_ENV=test)
  // to avoid long-running installs during CI/test runs.
  if (process.env.NODE_ENV !== 'test') {
    try {
      // Try to resolve via dynamic import first (works in both ESM/CommonJS runtimes)
      // If this succeeds, nothing to do.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      await import('@decaf-ts/mcp-server');
    } catch (err) {
      void err;
      try {
        const { execSync } = await import('child_process');
        // Install the latest version into the project
        execSync('npm install --save @decaf-ts/mcp-server@latest', { stdio: 'inherit' });
      } catch (e) {
        void e; // If install fails, leave a note in the memory folder for the user
        try {
          const notePath = path.resolve('.specify', 'memory', 'mcp-tools.md');
          const note = 'Note: automatic install of @decaf-ts/mcp-server failed. Please run `npm install --save @decaf-ts/mcp-server` manually.';
          await fs.writeFile(notePath, note, 'utf8');
        } catch (ee) {
          void ee;
        }
      }
    }
  }
}

export async function readAcronyms(filePath?: string): Promise<AcronymMap> {
  const p = filePath || path.resolve('.specify/memory/constitution.md');
  const content = await readConstitutionFile(p);
  const { block } = extractAcronymsBlock(content);
  if (!block) return {};
  // naive parse: find lines that look like "  "Label": "VALUE""
  const map: AcronymMap = {};
  const yamlLines = block.split('\n').filter((l) => l.trim().startsWith('"') || l.includes(':'));
  for (const line of yamlLines) {
    const m = line.match(/^\s*"?([^":]+)"?\s*:\s*"?([^"\n]+)"?/);
    if (m) {
      const key = m[1].trim();
      const val = m[2].trim();
      if (key !== 'Acronyms' && key !== 'BranchConfig' && key !== 'JiraMapping' && !key.startsWith('decafMcpEnabled')) {
        map[key] = val;
      } else if (key === 'Acronyms') {
        // skip header
      }
    }
  }
  return map;
}

export async function updateAcronyms(newMap: AcronymMap, filePath?: string): Promise<void> {
  const p = filePath || path.resolve('.specify/memory/constitution.md');
  let content = '';
  try {
    content = await fs.readFile(p, 'utf8');
  } catch (err) {
    void err;
    content = '# Project Constitution\n\n';
  }
  const { block, before, after } = extractAcronymsBlock(content);
  const merged: ConstitutionData = { Acronyms: newMap, decafMcpEnabled: true };
  const newBlock = buildAcronymsBlock(merged);
  const newContent = block ? `${before}${newBlock}${after}` : `${content}\n${newBlock}\n`;
  await fs.writeFile(p, newContent, 'utf8');
}

// Light-weight ConstitutionStore + helpers (used by other modules/tests)
export class ConstitutionStore {
  filePath: string;

  constructor(filePath?: string) {
    const repoRoot = process.cwd();
    this.filePath = filePath || path.join(repoRoot, '.specify', 'memory', 'constitution.md');
  }

  async readRaw(): Promise<string> {
    try {
      return await fs.readFile(this.filePath, 'utf8');
    } catch (e) {
      void e;
      return '# Project Constitution\n\n';
    }
  }

  private extractYamlBlock(md: string): string | null {
    // Prefer the fenced YAML block wrapped in our ACRONYMS markers if present
    const startMarker = '<!-- ACRONYMS-START -->';
    const endMarker = '<!-- ACRONYMS-END -->';
    const startIdx = md.indexOf(startMarker);
    const endIdx = md.indexOf(endMarker);
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const between = md.slice(startIdx + startMarker.length, endIdx);
      const reInner = /```(?:yaml|yml)\s*\n([\s\S]*?)\n```/m;
      const mInner = between.match(reInner);
      if (mInner) return mInner[1];
    }
    // Fallback: first yaml code fence in the document
    const re = /```(?:yaml|yml)\s*\n([\s\S]*?)\n```/m;
    const m = md.match(re);
    return m ? m[1] : null;
  }

  async read(): Promise<ConstitutionData> {
    const md = await this.readRaw();
    const yaml = this.extractYamlBlock(md);
    if (!yaml) return {};
    // Try JSON parse first
    try {
      return JSON.parse(yaml) as ConstitutionData;
    } catch (e) { void e;
      // Fallback: very small parser for our simple block
      const out: any = {};
      const lines = yaml.split(/\r?\n/).map((l) => l.replace(/^\s+/, ''));
  let current: any = out;
      for (const line of lines) {
        if (!line || line.startsWith('#')) continue;
        const m = line.match(/^([^:]+):(?:\s*(.*))?$/);
        if (!m) continue;
        const key = m[1].trim();
        const val = m[2] === undefined || m[2] === '' ? undefined : m[2].trim();
        if (val === undefined) {
          current[key] = {};
          current = current[key];
        } else {
          // unquote if present
          const v = val.replace(/^"|"$/g, '');
          current[key] = v === 'true' ? true : v === 'false' ? false : v;
        }
  }
      // Ensure common top-level keys exist even if empty
      if (!out.Acronyms) out.Acronyms = {};
      if (!out.BranchConfig) out.BranchConfig = {} as any;
      return out as ConstitutionData;
    }
  }

  async write(data: ConstitutionData): Promise<void> {
    const md = await this.readRaw().catch(() => '# Project Constitution\n\n');
    const yaml = this.extractYamlBlock(md) || '';
    const existing = yaml ? yaml : '';
    // Naive merge: overwrite Acronyms/BranchConfig keys
    const merged: any = {};
    try {
      Object.assign(merged, JSON.parse(existing));
    } catch (e) {
      void e; // ignore
    }
    Object.assign(merged, data || {});
  const newYaml = JSON.stringify(merged, null, 2);
  const newMd = md.split('```')[0] + '\n```yaml\n' + newYaml + '\n```\n';
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, newMd, 'utf8');
  }

  async getAcronyms(): Promise<Record<string, string>> {
    const d = await this.read();
    return (d && (d.Acronyms as Record<string, string>)) || {};
  }

  async setAcronyms(map: Record<string, string>): Promise<void> {
    const data = await this.read();
    data.Acronyms = { ...(data.Acronyms || {}), ...(map || {}) } as any;
    await this.write(data);
  }

  async getMcpEnabled(): Promise<boolean> {
    const d = await this.read();
    return d.decafMcpEnabled === undefined ? true : Boolean(d.decafMcpEnabled);
  }

  async setMcpEnabled(value: boolean): Promise<void> {
    const d = await this.read();
    d.decafMcpEnabled = !!value;
    await this.write(d);
  }
}

export async function readConstitution(): Promise<ConstitutionData> {
  const s = new ConstitutionStore();
  // Prefer the markdown-based store (up-to-date fenced YAML) and fall back
  // to a JSON snapshot if present. This ensures the most-recent human-editable
  // content is used by the tools/tests.
  try {
    const mdData = await s.read();
    if (mdData && (mdData.Acronyms || mdData.BranchConfig || mdData.JiraMapping)) {
      return mdData;
    }
  } catch (e) {
    void e; // ignore and try JSON snapshot
  }
  // As a last resort, try to parse simple, unfenced YAML blocks in the raw
  // constitution file (some tests write a bare '```yaml' block or plain YAML).
  try {
    const raw = await readConstitutionFile();
    const m = raw.match(/Acronyms:\s*\n([\s\S]*?)(?:\n\S|$)/m);
    if (m) {
      const block = m[1];
      const acr: any = {};
      for (const line of block.split(/\r?\n/)) {
        const lm = line.match(/^\s*(["']?)([^"':]+)\1\s*:\s*"?([^"\n]+)"?\s*$/);
        if (lm) acr[lm[2].trim()] = lm[3].trim();
      }
      return { Acronyms: acr } as ConstitutionData;
    }
  } catch (e) {
    void e; // ignore
  }
  const jsonPath = path.resolve('.specify', 'memory', 'constitution.json');
  try {
    const raw = await fs.readFile(jsonPath, 'utf8');
    return JSON.parse(raw) as ConstitutionData;
  } catch (e) {
    void e; // final fallback to empty
  }
  return {} as ConstitutionData;
}

export async function writeConstitution(data: ConstitutionData): Promise<void> {
  const s = new ConstitutionStore();
  return s.write(data);
}

export async function getAcronyms(): Promise<Record<string, string>> {
  const s = new ConstitutionStore();
  return s.getAcronyms();
}

export async function parseAcronymsFromFile(filePath?: string): Promise<Record<string, string>> {
  const p = filePath || path.resolve('.specify', 'memory', 'constitution.md');
  try {
    const raw = await fs.readFile(p, 'utf8');
    // Prefer marked block
    const markers = extractAcronymsBlock(raw);
    let block = markers.block;
    if (!block) {
      const m = raw.match(/```(?:yaml|yml)\s*\n([\s\S]*?)\n```/m);
      if (m) block = m[1];
    }
    if (!block) return {};
    const lines = block.split(/\r?\n/).map(l => l.replace(/^\s+/, ''));
    const acr: Record<string,string> = {};
    let inAcr = false;
    for (const line of lines) {
      if (!line) continue;
      if (/^Acronyms\s*:/i.test(line)) { inAcr = true; continue; }
      if (/^\w/.test(line) && inAcr && !/^\s/.test(line)) break;
      if (inAcr) {
        const kv = line.match(/^"?([^":]+)"?\s*:\s*"?([^"\n]+)"?/);
        if (kv) acr[kv[1].trim()] = kv[2].trim();
      }
    }
    return acr;
  } catch (e) {
    void e;
    return {};
  }
}

export default ConstitutionStore;
 



