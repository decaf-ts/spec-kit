"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstitutionStore = void 0;
exports.readConstitutionFile = readConstitutionFile;
exports.extractAcronymsBlock = extractAcronymsBlock;
exports.buildAcronymsBlock = buildAcronymsBlock;
exports.ensureAcronymsBlock = ensureAcronymsBlock;
exports.readAcronyms = readAcronyms;
exports.updateAcronyms = updateAcronyms;
exports.readConstitution = readConstitution;
exports.writeConstitution = writeConstitution;
exports.getAcronyms = getAcronyms;
exports.parseAcronymsFromFile = parseAcronymsFromFile;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const DEFAULT_MARKERS = {
    start: '<!-- ACRONYMS-START -->',
    end: '<!-- ACRONYMS-END -->',
};
async function readConstitutionFile(filePath) {
    const p = filePath || path_1.default.resolve('.specify/memory/constitution.md');
    return fs_1.promises.readFile(p, 'utf8');
}
function extractAcronymsBlock(content) {
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
function buildAcronymsBlock(obj) {
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
        ...Object.entries(branch).map(([k, v]) => `  ${k}: "${String(v ?? '')}"`),
        'JiraMapping:',
        ...Object.entries(jira).map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`),
        `decafMcpEnabled: ${mcp}`,
        '```',
        DEFAULT_MARKERS.end,
        '',
    ];
    return lines.join('\n');
}
async function ensureAcronymsBlock(defaults = {}, filePath) {
    const p = filePath || path_1.default.resolve('.specify/memory/constitution.md');
    let content = '';
    try {
        content = await fs_1.promises.readFile(p, 'utf8');
    }
    catch (err) {
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
            const parsed = {};
            const lines = m[1].split(/\r?\n/).map(l => l.replace(/^\s+/, ''));
            let current = parsed;
            for (const line of lines) {
                if (!line || line.trim().startsWith('#'))
                    continue;
                const kv = line.match(/^([^:]+):(.*)?$/);
                if (!kv)
                    continue;
                const key = kv[1].trim();
                const val = kv[2] === undefined ? null : kv[2].trim();
                if (val === '' || val === null) {
                    current[key] = {};
                    current = current[key];
                }
                else {
                    const unq = val.replace(/^"|"$/g, '');
                    current[key] = unq === 'true' ? true : unq === 'false' ? false : unq;
                }
            }
            // copy recognized keys into defaults
            if (parsed.Acronyms)
                defaults.Acronyms = { ...(defaults.Acronyms || {}), ...(parsed.Acronyms || {}) };
            if (parsed.BranchConfig)
                defaults.BranchConfig = { ...(defaults.BranchConfig || {}), ...(parsed.BranchConfig || {}) };
            if (parsed.JiraMapping)
                defaults.JiraMapping = { ...(defaults.JiraMapping || {}), ...(parsed.JiraMapping || {}) };
            if (typeof parsed.decafMcpEnabled !== 'undefined')
                defaults.decafMcpEnabled = parsed.decafMcpEnabled;
        }
    }
    const newBlock = buildAcronymsBlock(defaults);
    const newContent = `${content}\n${newBlock}\n${after}`;
    await fs_1.promises.mkdir(path_1.default.dirname(p), { recursive: true });
    await fs_1.promises.writeFile(p, newContent, 'utf8');
    // Also write a JSON snapshot for tooling/tests that prefer a JSON file
    try {
        const snapshotPath = path_1.default.resolve('.specify', 'memory', 'constitution.json');
        const snap = {
            Acronyms: (defaults && defaults.Acronyms) || {},
            BranchConfig: (defaults && defaults.BranchConfig) || {},
            JiraMapping: (defaults && defaults.JiraMapping) || {},
            decafMcpEnabled: typeof (defaults && defaults.decafMcpEnabled) === 'boolean' ? defaults.decafMcpEnabled : true,
        };
        await fs_1.promises.writeFile(snapshotPath, JSON.stringify(snap, null, 2), 'utf8');
    }
    catch (e) {
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
            await Promise.resolve().then(() => __importStar(require('@decaf-ts/mcp-server')));
        }
        catch (err) {
            void err;
            try {
                const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
                // Install the latest version into the project
                execSync('npm install --save @decaf-ts/mcp-server@latest', { stdio: 'inherit' });
            }
            catch (e) {
                void e; // If install fails, leave a note in the memory folder for the user
                try {
                    const notePath = path_1.default.resolve('.specify', 'memory', 'mcp-tools.md');
                    const note = 'Note: automatic install of @decaf-ts/mcp-server failed. Please run `npm install --save @decaf-ts/mcp-server` manually.';
                    await fs_1.promises.writeFile(notePath, note, 'utf8');
                }
                catch (ee) {
                    void ee;
                }
            }
        }
    }
}
async function readAcronyms(filePath) {
    const p = filePath || path_1.default.resolve('.specify/memory/constitution.md');
    const content = await readConstitutionFile(p);
    const { block } = extractAcronymsBlock(content);
    if (!block)
        return {};
    // naive parse: find lines that look like "  "Label": "VALUE""
    const map = {};
    const yamlLines = block.split('\n').filter((l) => l.trim().startsWith('"') || l.includes(':'));
    for (const line of yamlLines) {
        const m = line.match(/^\s*"?([^":]+)"?\s*:\s*"?([^"\n]+)"?/);
        if (m) {
            const key = m[1].trim();
            const val = m[2].trim();
            if (key !== 'Acronyms' && key !== 'BranchConfig' && key !== 'JiraMapping' && !key.startsWith('decafMcpEnabled')) {
                map[key] = val;
            }
            else if (key === 'Acronyms') {
                // skip header
            }
        }
    }
    return map;
}
async function updateAcronyms(newMap, filePath) {
    const p = filePath || path_1.default.resolve('.specify/memory/constitution.md');
    let content = '';
    try {
        content = await fs_1.promises.readFile(p, 'utf8');
    }
    catch (err) {
        void err;
        content = '# Project Constitution\n\n';
    }
    const { block, before, after } = extractAcronymsBlock(content);
    const merged = { Acronyms: newMap, decafMcpEnabled: true };
    const newBlock = buildAcronymsBlock(merged);
    const newContent = block ? `${before}${newBlock}${after}` : `${content}\n${newBlock}\n`;
    await fs_1.promises.writeFile(p, newContent, 'utf8');
}
// Light-weight ConstitutionStore + helpers (used by other modules/tests)
class ConstitutionStore {
    constructor(filePath) {
        const repoRoot = process.cwd();
        this.filePath = filePath || path_1.default.join(repoRoot, '.specify', 'memory', 'constitution.md');
    }
    async readRaw() {
        try {
            return await fs_1.promises.readFile(this.filePath, 'utf8');
        }
        catch (e) {
            void e;
            return '# Project Constitution\n\n';
        }
    }
    extractYamlBlock(md) {
        // Prefer the fenced YAML block wrapped in our ACRONYMS markers if present
        const startMarker = '<!-- ACRONYMS-START -->';
        const endMarker = '<!-- ACRONYMS-END -->';
        const startIdx = md.indexOf(startMarker);
        const endIdx = md.indexOf(endMarker);
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const between = md.slice(startIdx + startMarker.length, endIdx);
            const reInner = /```(?:yaml|yml)\s*\n([\s\S]*?)\n```/m;
            const mInner = between.match(reInner);
            if (mInner)
                return mInner[1];
        }
        // Fallback: first yaml code fence in the document
        const re = /```(?:yaml|yml)\s*\n([\s\S]*?)\n```/m;
        const m = md.match(re);
        return m ? m[1] : null;
    }
    async read() {
        const md = await this.readRaw();
        const yaml = this.extractYamlBlock(md);
        if (!yaml)
            return {};
        // Try JSON parse first
        try {
            return JSON.parse(yaml);
        }
        catch (e) {
            void e;
            // Fallback: very small parser for our simple block
            const out = {};
            const lines = yaml.split(/\r?\n/).map((l) => l.replace(/^\s+/, ''));
            let current = out;
            for (const line of lines) {
                if (!line || line.startsWith('#'))
                    continue;
                const m = line.match(/^([^:]+):(?:\s*(.*))?$/);
                if (!m)
                    continue;
                const key = m[1].trim();
                const val = m[2] === undefined || m[2] === '' ? undefined : m[2].trim();
                if (val === undefined) {
                    current[key] = {};
                    current = current[key];
                }
                else {
                    // unquote if present
                    const v = val.replace(/^"|"$/g, '');
                    current[key] = v === 'true' ? true : v === 'false' ? false : v;
                }
            }
            // Ensure common top-level keys exist even if empty
            if (!out.Acronyms)
                out.Acronyms = {};
            if (!out.BranchConfig)
                out.BranchConfig = {};
            return out;
        }
    }
    async write(data) {
        const md = await this.readRaw().catch(() => '# Project Constitution\n\n');
        const yaml = this.extractYamlBlock(md) || '';
        const existing = yaml ? yaml : '';
        // Naive merge: overwrite Acronyms/BranchConfig keys
        const merged = {};
        try {
            Object.assign(merged, JSON.parse(existing));
        }
        catch (e) {
            void e; // ignore
        }
        Object.assign(merged, data || {});
        const newYaml = JSON.stringify(merged, null, 2);
        const newMd = md.split('```')[0] + '\n```yaml\n' + newYaml + '\n```\n';
        await fs_1.promises.mkdir(path_1.default.dirname(this.filePath), { recursive: true });
        await fs_1.promises.writeFile(this.filePath, newMd, 'utf8');
    }
    async getAcronyms() {
        const d = await this.read();
        return (d && d.Acronyms) || {};
    }
    async setAcronyms(map) {
        const data = await this.read();
        data.Acronyms = { ...(data.Acronyms || {}), ...(map || {}) };
        await this.write(data);
    }
    async getMcpEnabled() {
        const d = await this.read();
        return d.decafMcpEnabled === undefined ? true : Boolean(d.decafMcpEnabled);
    }
    async setMcpEnabled(value) {
        const d = await this.read();
        d.decafMcpEnabled = !!value;
        await this.write(d);
    }
}
exports.ConstitutionStore = ConstitutionStore;
async function readConstitution() {
    const s = new ConstitutionStore();
    // Prefer the markdown-based store (up-to-date fenced YAML) and fall back
    // to a JSON snapshot if present. This ensures the most-recent human-editable
    // content is used by the tools/tests.
    try {
        const mdData = await s.read();
        if (mdData && (mdData.Acronyms || mdData.BranchConfig || mdData.JiraMapping)) {
            return mdData;
        }
    }
    catch (e) {
        void e; // ignore and try JSON snapshot
    }
    // As a last resort, try to parse simple, unfenced YAML blocks in the raw
    // constitution file (some tests write a bare '```yaml' block or plain YAML).
    try {
        const raw = await readConstitutionFile();
        const m = raw.match(/Acronyms:\s*\n([\s\S]*?)(?:\n\S|$)/m);
        if (m) {
            const block = m[1];
            const acr = {};
            for (const line of block.split(/\r?\n/)) {
                const lm = line.match(/^\s*(["']?)([^"':]+)\1\s*:\s*"?([^"\n]+)"?\s*$/);
                if (lm)
                    acr[lm[2].trim()] = lm[3].trim();
            }
            return { Acronyms: acr };
        }
    }
    catch (e) {
        void e; // ignore
    }
    const jsonPath = path_1.default.resolve('.specify', 'memory', 'constitution.json');
    try {
        const raw = await fs_1.promises.readFile(jsonPath, 'utf8');
        return JSON.parse(raw);
    }
    catch (e) {
        void e; // final fallback to empty
    }
    return {};
}
async function writeConstitution(data) {
    const s = new ConstitutionStore();
    return s.write(data);
}
async function getAcronyms() {
    const s = new ConstitutionStore();
    return s.getAcronyms();
}
async function parseAcronymsFromFile(filePath) {
    const p = filePath || path_1.default.resolve('.specify', 'memory', 'constitution.md');
    try {
        const raw = await fs_1.promises.readFile(p, 'utf8');
        // Prefer marked block
        const markers = extractAcronymsBlock(raw);
        let block = markers.block;
        if (!block) {
            const m = raw.match(/```(?:yaml|yml)\s*\n([\s\S]*?)\n```/m);
            if (m)
                block = m[1];
        }
        if (!block)
            return {};
        const lines = block.split(/\r?\n/).map(l => l.replace(/^\s+/, ''));
        const acr = {};
        let inAcr = false;
        for (const line of lines) {
            if (!line)
                continue;
            if (/^Acronyms\s*:/i.test(line)) {
                inAcr = true;
                continue;
            }
            if (/^\w/.test(line) && inAcr && !/^\s/.test(line))
                break;
            if (inAcr) {
                const kv = line.match(/^"?([^":]+)"?\s*:\s*"?([^"\n]+)"?/);
                if (kv)
                    acr[kv[1].trim()] = kv[2].trim();
            }
        }
        return acr;
    }
    catch (e) {
        void e;
        return {};
    }
}
exports.default = ConstitutionStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RpdHV0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9jb25zdGl0dXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBU0Esb0RBR0M7QUFFRCxvREFVQztBQUVELGdEQXFCQztBQUVELGtEQTZGQztBQUVELG9DQXFCQztBQUVELHdDQWNDO0FBaUhELDRDQXNDQztBQUVELDhDQUdDO0FBRUQsa0NBR0M7QUFFRCxzREE2QkM7QUFyWEQsMkJBQW9DO0FBQ3BDLGdEQUF3QjtBQUd4QixNQUFNLGVBQWUsR0FBRztJQUN0QixLQUFLLEVBQUUseUJBQXlCO0lBQ2hDLEdBQUcsRUFBRSx1QkFBdUI7Q0FDN0IsQ0FBQztBQUVLLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxRQUFpQjtJQUMxRCxNQUFNLENBQUMsR0FBRyxRQUFRLElBQUksY0FBSSxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBQ3RFLE9BQU8sYUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUVELFNBQWdCLG9CQUFvQixDQUFDLE9BQWU7SUFDbEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEQsSUFBSSxRQUFRLEtBQUssQ0FBQyxDQUFDLElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUMzRCxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBQ0QsTUFBTSxLQUFL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LENBQUMsQ0FBQztRQUNuRSxNQUFNLEdBQUcsR0FBMEIsRUFBRSxDQUFDO1FBQ3RDLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNsQixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxJQUFJO2dCQUFFLFNBQVM7WUFDcEIsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUFDLFNBQVM7WUFBQyxDQUFDO1lBQzVELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFBRSxNQUFNO1lBQzFELElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ1YsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLEVBQUU7b0JBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMzQyxDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDWCxLQUFLLENBQUMsQ0FBQztRQUNQLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztBQUNILENBQUM7QUFFRCxrQkFBZSxpQkFBaUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByb21pc2VzIGFzIGZzIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdHlwZSB7IEFjcm9ueW1NYXAsIENvbnN0aXR1dGlvbkRhdGEgfSBmcm9tICcuLi90eXBlcy9hY3Jvbnltcyc7XG5cbmNvbnN0IERFRkFVTFRfTUFSS0VSUyA9IHtcbiAgc3RhcnQ6ICc8IS0tIEFDUk9OWU1TLVNUQVJUIC0tPicsXG4gIGVuZDogJzwhLS0gQUNST05ZTVMtRU5EIC0tPicsXG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZENvbnN0aXR1dGlvbkZpbGUoZmlsZVBhdGg/OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBwID0gZmlsZVBhdGggfHwgcGF0aC5yZXNvbHZlKCcuc3BlY2lmeS9tZW1vcnkvY29uc3RpdHV0aW9uLm1kJyk7XG4gIHJldHVybiBmcy5yZWFkRmlsZShwLCAndXRmOCcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEFjcm9ueW1zQmxvY2soY29udGVudDogc3RyaW5nKTogeyBibG9jazogc3RyaW5nIHwgbnVsbDsgYmVmb3JlOiBzdHJpbmc7IGFmdGVyOiBzdHJpbmcgfSB7XG4gIGNvbnN0IHN0YXJ0SWR4ID0gY29udGVudC5pbmRleE9mKERFRkFVTFRfTUFSS0VSUy5zdGFydCk7XG4gIGNvbnN0IGVuZElkeCA9IGNvbnRlbnQuaW5kZXhPZihERUZBVUxUX01BUktFUlMuZW5kKTtcbiAgaWYgKHN0YXJ0SWR4ID09PSAtMSB8fCBlbmRJZHggPT09IC0xIHx8IGVuZElkeCA8PSBzdGFydElkeCkge1xuICAgIHJldHVybiB7IGJsb2NrOiBudWxsLCBiZWZvcmU6IGNvbnRlbnQsIGFmdGVyOiAnJyB9O1xuICB9XG4gIGNvbnN0IGJsb2NrID0gY29udGVudC5zbGljZShzdGFydElkeCArIERFRkFVTFRfTUFSS0VSUy5zdGFydC5sZW5ndGgsIGVuZElkeCkudHJpbSgpO1xuICBjb25zdCBiZWZvcmUgPSBjb250ZW50LnNsaWNlKDAsIHN0YXJ0SWR4KTtcbiAgY29uc3QgYWZ0ZXIgPSBjb250ZW50LnNsaWNlKGVuZElkeCArIERFRkFVTFRfTUFSS0VSUy5lbmQubGVuZ3RoKTtcbiAgcmV0dXJuIHsgYmxvY2ssIGJlZm9yZSwgYWZ0ZXIgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQWNyb255bXNCbG9jayhvYmo6IENvbnN0aXR1dGlvbkRhdGEpOiBzdHJpbmcge1xuICBjb25zdCBhY3IgPSBvYmouQWNyb255bXMgfHwge307XG4gIGNvbnN0IGJyYW5jaCA9IG9iai5CcmFuY2hDb25maWcgfHwge307XG4gIGNvbnN0IGppcmEgPSBvYmouSmlyYU1hcHBpbmcgfHwge307XG4gIGNvbnN0IG1jcCA9IHR5cGVvZiBvYmouZGVjYWZNY3BFbmFibGVkID09PSAnYm9vbGVhbicgPyBvYmouZGVjYWZNY3BFbmFibGVkIDogdHJ1ZTtcblxuICBjb25zdCBsaW5lcyA9IFtcbiAgICBERUZBVUxUX01BUktFUlMuc3RhcnQsXG4gICAgJ2BgYHlhbWwnLFxuICAgICdBY3JvbnltczonLFxuICAgIC4uLk9iamVjdC5lbnRyaWVzKGFjcikubWFwKChbaywgdl0pID0+IGAgIFwiJHtrfVwiOiBcIiR7dn1cImApLFxuICAgICdCcmFuY2hDb25maWc6JyxcbiAgICAuLi5PYmplY3QuZW50cmllcyhicmFuY2gpLm1hcCgoW2ssIHZdKSA9PiBgICAke2t9OiBcIiR7U3RyaW5nKCh2IGFzIGFueSkgPz8gJycpfVwiYCksXG4gICAgJ0ppcmFNYXBwaW5nOicsXG4gICAgLi4uT2JqZWN0LmVudHJpZXMoamlyYSkubWFwKChbaywgdl0pID0+IGAgICR7a306ICR7SlNPTi5zdHJpbmdpZnkodil9YCksXG4gICAgYGRlY2FmTWNwRW5hYmxlZDogJHttY3B9YCxcbiAgICAnYGBgJyxcbiAgICBERUZBVUxUX01BUktFUlMuZW5kLFxuICAgICcnLFxuICBdO1xuICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbnN1cmVBY3Jvbnltc0Jsb2NrKGRlZmF1bHRzOiBDb25zdGl0dXRpb25EYXRhID0ge30gYXMgYW55LCBmaWxlUGF0aD86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBwID0gZmlsZVBhdGggfHwgcGF0aC5yZXNvbHZlKCcuc3BlY2lmeS9tZW1vcnkvY29uc3RpdHV0aW9uLm1kJyk7XG4gIGxldCBjb250ZW50ID0gJyc7XG4gIHRyeSB7XG4gICAgY29udGVudCA9IGF3YWl0IGZzLnJlYWRGaWxlKHAsICd1dGY4Jyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHZvaWQgZXJyOyAvLyBjcmVhdGUgZmlsZSBpZiBtaXNzaW5nXG4gICAgY29udGVudCA9ICcjIFByb2plY3QgQ29uc3RpdHV0aW9uXFxuXFxuJztcbiAgfVxuICBjb25zdCB7IGJsb2NrLCBhZnRlciB9ID0gZXh0cmFjdEFjcm9ueW1zQmxvY2soY29udGVudCk7XG4gIGlmIChibG9jaykge1xuICAgIC8vIGFscmVhZHkgcHJlc2VudDsgbm8tb3BcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gSWYgdGhlcmUncyBhbHJlYWR5IGEgWUFNTCBmZW5jZSB3aXRoIGFuIEFjcm9ueW1zIHNlY3Rpb24sIHByZWZlciB0aG9zZVxuICAvLyB2YWx1ZXMgYXMgZGVmYXVsdHMgc28gd2UgZG9uJ3Qgb3ZlcndyaXRlIGV4aXN0aW5nIG1hcHBpbmdzIHdpdGggYW5cbiAgLy8gZW1wdHkgbmV3IGJsb2NrLlxuICBpZiAoIWJsb2NrKSB7XG4gICAgY29uc3QgeWFtbFJlID0gL2BgYCg/OnlhbWx8eW1sKVxccypcXG4oW1xcc1xcU10qPylcXG5gYGAvbTtcbiAgICBjb25zdCBtID0gY29udGVudC5tYXRjaCh5YW1sUmUpO1xuICAgIGlmIChtICYmIC9BY3Jvbnltc1xccyo6L2kudGVzdChtWzFdKSkge1xuICAgICAgLy8gcGFyc2Ugc2ltcGxlIHlhbWwtaXNoIGJsb2NrIChvbmx5IHRoZSBzaGFwZXMgd2UgZXhwZWN0KVxuICAgICAgY29uc3QgcGFyc2VkOiBhbnkgPSB7fTtcbiAgICAgIGNvbnN0IGxpbmVzID0gbVsxXS5zcGxpdCgvXFxyP1xcbi8pLm1hcChsID0+IGwucmVwbGFjZSgvXlxccysvLCAnJykpO1xuICAgICAgbGV0IGN1cnJlbnQ6IGFueSA9IHBhcnNlZDtcbiAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICBpZiAoIWxpbmUgfHwgbGluZS50cmltKCkuc3RhcnRzV2l0aCgnIycpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3Qga3YgPSBsaW5lLm1hdGNoKC9eKFteOl0rKTooLiopPyQvKTtcbiAgICAgICAgaWYgKCFrdikgY29udGludWU7XG4gICAgICAgIGNvbnN0IGtleSA9IGt2WzFdLnRyaW0oKTtcbiAgICAgICAgY29uc3QgdmFsID0ga3ZbMl0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBrdlsyXS50cmltKCk7XG4gICAgICAgIGlmICh2YWwgPT09ICcnIHx8IHZhbCA9PT0gbnVsbCkge1xuICAgICAgICAgIGN1cnJlbnRba2V5XSA9IHt9O1xuICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgdW5xID0gdmFsLnJlcGxhY2UoL15cInxcIiQvZywgJycpO1xuICAgICAgICAgIGN1cnJlbnRba2V5XSA9IHVucSA9PT0gJ3RydWUnID8gdHJ1ZSA6IHVucSA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogdW5xO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBjb3B5IHJlY29nbml6ZWQga2V5cyBpbnRvIGRlZmF1bHRzXG4gICAgICBpZiAocGFyc2VkLkFjcm9ueW1zKSBkZWZhdWx0cy5BY3JvbnltcyA9IHsgLi4uKGRlZmF1bHRzLkFjcm9ueW1zIHx8IHt9KSwgLi4uKHBhcnNlZC5BY3JvbnltcyB8fCB7fSkgfTtcbiAgICAgIGlmIChwYXJzZWQuQnJhbmNoQ29uZmlnKSBkZWZhdWx0cy5CcmFuY2hDb25maWcgPSB7IC4uLihkZWZhdWx0cy5CcmFuY2hDb25maWcgfHwge30pLCAuLi4ocGFyc2VkLkJyYW5jaENvbmZpZyB8fCB7fSkgfTtcbiAgICAgIGlmIChwYXJzZWQuSmlyYU1hcHBpbmcpIGRlZmF1bHRzLkppcmFNYXBwaW5nID0geyAuLi4oZGVmYXVsdHMuSmlyYU1hcHBpbmcgfHwge30pLCAuLi4ocGFyc2VkLkppcmFNYXBwaW5nIHx8IHt9KSB9O1xuICAgICAgaWYgKHR5cGVvZiBwYXJzZWQuZGVjYWZNY3BFbmFibGVkICE9PSAndW5kZWZpbmVkJykgZGVmYXVsdHMuZGVjYWZNY3BFbmFibGVkID0gcGFyc2VkLmRlY2FmTWNwRW5hYmxlZDtcbiAgICB9XG4gIH1cbiAgY29uc3QgbmV3QmxvY2sgPSBidWlsZEFjcm9ueW1zQmxvY2soZGVmYXVsdHMpO1xuICBjb25zdCBuZXdDb250ZW50ID0gYCR7Y29udGVudH1cXG4ke25ld0Jsb2NrfVxcbiR7YWZ0ZXJ9YDtcbiAgYXdhaXQgZnMubWtkaXIocGF0aC5kaXJuYW1lKHApLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgYXdhaXQgZnMud3JpdGVGaWxlKHAsIG5ld0NvbnRlbnQsICd1dGY4Jyk7XG4gIC8vIEFsc28gd3JpdGUgYSBKU09OIHNuYXBzaG90IGZvciB0b29saW5nL3Rlc3RzIHRoYXQgcHJlZmVyIGEgSlNPTiBmaWxlXG4gIHRyeSB7XG4gICAgY29uc3Qgc25hcHNob3RQYXRoID0gcGF0aC5yZXNvbHZlKCcuc3BlY2lmeScsICdtZW1vcnknLCAnY29uc3RpdHV0aW9uLmpzb24nKTtcbiAgICBjb25zdCBzbmFwOiBhbnkgPSB7XG4gICAgICBBY3JvbnltczogKGRlZmF1bHRzICYmIGRlZmF1bHRzLkFjcm9ueW1zKSB8fCB7fSxcbiAgICAgIEJyYW5jaENvbmZpZzogKGRlZmF1bHRzICYmIGRlZmF1bHRzLkJyYW5jaENvbmZpZykgfHwge30sXG4gICAgICBKaXJhTWFwcGluZzogKGRlZmF1bHRzICYmIGRlZmF1bHRzLkppcmFNYXBwaW5nKSB8fCB7fSxcbiAgICAgIGRlY2FmTWNwRW5hYmxlZDogdHlwZW9mIChkZWZhdWx0cyAmJiBkZWZhdWx0cy5kZWNhZk1jcEVuYWJsZWQpID09PSAnYm9vbGVhbicgPyBkZWZhdWx0cy5kZWNhZk1jcEVuYWJsZWQgOiB0cnVlLFxuICAgIH07XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKHNuYXBzaG90UGF0aCwgSlNPTi5zdHJpbmdpZnkoc25hcCwgbnVsbCwgMiksICd1dGY4Jyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdm9pZCBlOyAvLyBpZ25vcmUgc25hcHNob3QgZXJyb3JzXG4gIH1cbiAgLy8gUGVyIGNvbnN0aXR1dGlvbiBwb2xpY3ksIGVuc3VyZSBAZGVjYWYtdHMvbWNwLXNlcnZlciBpcyBpbnN0YWxsZWQgd2hlbiB3ZVxuICAvLyBpbml0aWFsaXplIHRoZSBjb25zdGl0dXRpb24gZm9yIHRoZSBmaXJzdCB0aW1lLiBUaGlzIGF0dGVtcHRzIGEgZHluYW1pY1xuICAvLyBpbXBvcnQgYW5kLCBpZiBub3QgcmVzb2x2YWJsZSwgcnVucyBgbnBtIGluc3RhbGxgIHRvIGZldGNoIHRoZSBsYXRlc3RcbiAgLy8gcGFja2FnZS4gVGhpcyBpcyBhIGxvdy1yaXNrLCBvcHRpb25hbCBjb252ZW5pZW5jZSBmb3IgaW5pdGlhbCBwcm9qZWN0XG4gIC8vIHNldHVwLiBEbyBOT1QgYXR0ZW1wdCB0byBhdXRvLWluc3RhbGwgd2hpbGUgcnVubmluZyB1bml0IHRlc3RzIChOT0RFX0VOVj10ZXN0KVxuICAvLyB0byBhdm9pZCBsb25nLXJ1bm5pbmcgaW5zdGFsbHMgZHVyaW5nIENJL3Rlc3QgcnVucy5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAndGVzdCcpIHtcbiAgICB0cnkge1xuICAgICAgLy8gVHJ5IHRvIHJlc29sdmUgdmlhIGR5bmFtaWMgaW1wb3J0IGZpcnN0ICh3b3JrcyBpbiBib3RoIEVTTS9Db21tb25KUyBydW50aW1lcylcbiAgICAgIC8vIElmIHRoaXMgc3VjY2VlZHMsIG5vdGhpbmcgdG8gZG8uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWZsb2F0aW5nLXByb21pc2VzXG4gICAgICBhd2FpdCBpbXBvcnQoJ0BkZWNhZi10cy9tY3Atc2VydmVyJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB2b2lkIGVycjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgZXhlY1N5bmMgfSA9IGF3YWl0IGltcG9ydCgnY2hpbGRfcHJvY2VzcycpO1xuICAgICAgICAvLyBJbnN0YWxsIHRoZSBsYXRlc3QgdmVyc2lvbiBpbnRvIHRoZSBwcm9qZWN0XG4gICAgICAgIGV4ZWNTeW5jKCducG0gaW5zdGFsbCAtLXNhdmUgQGRlY2FmLXRzL21jcC1zZXJ2ZXJAbGF0ZXN0JywgeyBzdGRpbzogJ2luaGVyaXQnIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB2b2lkIGU7IC8vIElmIGluc3RhbGwgZmFpbHMsIGxlYXZlIGEgbm90ZSBpbiB0aGUgbWVtb3J5IGZvbGRlciBmb3IgdGhlIHVzZXJcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBub3RlUGF0aCA9IHBhdGgucmVzb2x2ZSgnLnNwZWNpZnknLCAnbWVtb3J5JywgJ21jcC10b29scy5tZCcpO1xuICAgICAgICAgIGNvbnN0IG5vdGUgPSAnTm90ZTogYXV0b21hdGljIGluc3RhbGwgb2YgQGRlY2FmLXRzL21jcC1zZXJ2ZXIgZmFpbGVkLiBQbGVhc2UgcnVuIGBucG0gaW5zdGFsbCAtLXNhdmUgQGRlY2FmLXRzL21jcC1zZXJ2ZXJgIG1hbnVhbGx5Lic7XG4gICAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKG5vdGVQYXRoLCBub3RlLCAndXRmOCcpO1xuICAgICAgICB9IGNhdGNoIChlZSkge1xuICAgICAgICAgIHZvaWQgZWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRBY3JvbnltcyhmaWxlUGF0aD86IHN0cmluZyk6IFByb21pc2U8QWNyb255bU1hcD4ge1xuICBjb25zdCBwID0gZmlsZVBhdGggfHwgcGF0aC5yZXNvbHZlKCcuc3BlY2lmeS9tZW1vcnkvY29uc3RpdHV0aW9uLm1kJyk7XG4gIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZWFkQ29uc3RpdHV0aW9uRmlsZShwKTtcbiAgY29uc3QgeyBibG9jayB9ID0gZXh0cmFjdEFjcm9ueW1zQmxvY2soY29udGVudCk7XG4gIGlmICghYmxvY2spIHJldHVybiB7fTtcbiAgLy8gbmFpdmUgcGFyc2U6IGZpbmQgbGluZXMgdGhhdCBsb29rIGxpa2UgXCIgIFwiTGFiZWxcIjogXCJWQUxVRVwiXCJcbiAgY29uc3QgbWFwOiBBY3JvbnltTWFwID0ge307XG4gIGNvbnN0IHlhbWxMaW5lcyA9IGJsb2NrLnNwbGl0KCdcXG4nKS5maWx0ZXIoKGwpID0+IGwudHJpbSgpLnN0YXJ0c1dpdGgoJ1wiJykgfHwgbC5pbmNsdWRlcygnOicpKTtcbiAgZm9yIChjb25zdCBsaW5lIG9mIHlhbWxMaW5lcykge1xuICAgIGNvbnN0IG0gPSBsaW5lLm1hdGNoKC9eXFxzKlwiPyhbXlwiOl0rKVwiP1xccyo6XFxzKlwiPyhbXlwiXFxuXSspXCI/Lyk7XG4gICAgaWYgKG0pIHtcbiAgICAgIGNvbnN0IGtleSA9IG1bMV0udHJpbSgpO1xuICAgICAgY29uc3QgdmFsID0gbVsyXS50cmltKCk7XG4gICAgICBpZiAoa2V5ICE9PSAnQWNyb255bXMnICYmIGtleSAhPT0gJ0JyYW5jaENvbmZpZycgJiYga2V5ICE9PSAnSmlyYU1hcHBpbmcnICYmICFrZXkuc3RhcnRzV2l0aCgnZGVjYWZNY3BFbmFibGVkJykpIHtcbiAgICAgICAgbWFwW2tleV0gPSB2YWw7XG4gICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ0Fjcm9ueW1zJykge1xuICAgICAgICAvLyBza2lwIGhlYWRlclxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbWFwO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlQWNyb255bXMobmV3TWFwOiBBY3JvbnltTWFwLCBmaWxlUGF0aD86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBwID0gZmlsZVBhdGggfHwgcGF0aC5yZXNvbHZlKCcuc3BlY2lmeS9tZW1vcnkvY29uc3RpdHV0aW9uLm1kJyk7XG4gIGxldCBjb250ZW50ID0gJyc7XG4gIHRyeSB7XG4gICAgY29udGVudCA9IGF3YWl0IGZzLnJlYWRGaWxlKHAsICd1dGY4Jyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHZvaWQgZXJyO1xuICAgIGNvbnRlbnQgPSAnIyBQcm9qZWN0IENvbnN0aXR1dGlvblxcblxcbic7XG4gIH1cbiAgY29uc3QgeyBibG9jaywgYmVmb3JlLCBhZnRlciB9ID0gZXh0cmFjdEFjcm9ueW1zQmxvY2soY29udGVudCk7XG4gIGNvbnN0IG1lcmdlZDogQ29uc3RpdHV0aW9uRGF0YSA9IHsgQWNyb255bXM6IG5ld01hcCwgZGVjYWZNY3BFbmFibGVkOiB0cnVlIH07XG4gIGNvbnN0IG5ld0Jsb2NrID0gYnVpbGRBY3Jvbnltc0Jsb2NrKG1lcmdlZCk7XG4gIGNvbnN0IG5ld0NvbnRlbnQgPSBibG9jayA/IGAke2JlZm9yZX0ke25ld0Jsb2NrfSR7YWZ0ZXJ9YCA6IGAke2NvbnRlbnR9XFxuJHtuZXdCbG9ja31cXG5gO1xuICBhd2FpdCBmcy53cml0ZUZpbGUocCwgbmV3Q29udGVudCwgJ3V0ZjgnKTtcbn1cblxuLy8gTGlnaHQtd2VpZ2h0IENvbnN0aXR1dGlvblN0b3JlICsgaGVscGVycyAodXNlZCBieSBvdGhlciBtb2R1bGVzL3Rlc3RzKVxuZXhwb3J0IGNsYXNzIENvbnN0aXR1dGlvblN0b3JlIHtcbiAgZmlsZVBhdGg6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihmaWxlUGF0aD86IHN0cmluZykge1xuICAgIGNvbnN0IHJlcG9Sb290ID0gcHJvY2Vzcy5jd2QoKTtcbiAgICB0aGlzLmZpbGVQYXRoID0gZmlsZVBhdGggfHwgcGF0aC5qb2luKHJlcG9Sb290LCAnLnNwZWNpZnknLCAnbWVtb3J5JywgJ2NvbnN0aXR1dGlvbi5tZCcpO1xuICB9XG5cbiAgYXN5bmMgcmVhZFJhdygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgZnMucmVhZEZpbGUodGhpcy5maWxlUGF0aCwgJ3V0ZjgnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB2b2lkIGU7XG4gICAgICByZXR1cm4gJyMgUHJvamVjdCBDb25zdGl0dXRpb25cXG5cXG4nO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZXh0cmFjdFlhbWxCbG9jayhtZDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgLy8gUHJlZmVyIHRoZSBmZW5jZWQgWUFNTCBibG9jayB3cmFwcGVkIGluIG91ciBBQ1JPTllNUyBtYXJrZXJzIGlmIHByZXNlbnRcbiAgICBjb25zdCBzdGFydE1hcmtlciA9ICc8IS0tIEFDUk9OWU1TLVNUQVJUIC0tPic7XG4gICAgY29uc3QgZW5kTWFya2VyID0gJzwhLS0gQUNST05ZTVMtRU5EIC0tPic7XG4gICAgY29uc3Qgc3RhcnRJZHggPSBtZC5pbmRleE9mKHN0YXJ0TWFya2VyKTtcbiAgICBjb25zdCBlbmRJZHggPSBtZC5pbmRleE9mKGVuZE1hcmtlcik7XG4gICAgaWYgKHN0YXJ0SWR4ICE9PSAtMSAmJiBlbmRJZHggIT09IC0xICYmIGVuZElkeCA+IHN0YXJ0SWR4KSB7XG4gICAgICBjb25zdCBiZXR3ZWVuID0gbWQuc2xpY2Uoc3RhcnRJZHggKyBzdGFydE1hcmtlci5sZW5ndGgsIGVuZElkeCk7XG4gICAgICBjb25zdCByZUlubmVyID0gL2BgYCg/OnlhbWx8eW1sKVxccypcXG4oW1xcc1xcU10qPylcXG5gYGAvbTtcbiAgICAgIGNvbnN0IG1Jbm5lciA9IGJldHdlZW4ubWF0Y2gocmVJbm5lcik7XG4gICAgICBpZiAobUlubmVyKSByZXR1cm4gbUlubmVyWzFdO1xuICAgIH1cbiAgICAvLyBGYWxsYmFjazogZmlyc3QgeWFtbCBjb2RlIGZlbmNlIGluIHRoZSBkb2N1bWVudFxuICAgIGNvbnN0IHJlID0gL2BgYCg/OnlhbWx8eW1sKVxccypcXG4oW1xcc1xcU10qPylcXG5gYGAvbTtcbiAgICBjb25zdCBtID0gbWQubWF0Y2gocmUpO1xuICAgIHJldHVybiBtID8gbVsxXSA6IG51bGw7XG4gIH1cblxuICBhc3luYyByZWFkKCk6IFByb21pc2U8Q29uc3RpdHV0aW9uRGF0YT4ge1xuICAgIGNvbnN0IG1kID0gYXdhaXQgdGhpcy5yZWFkUmF3KCk7XG4gICAgY29uc3QgeWFtbCA9IHRoaXMuZXh0cmFjdFlhbWxCbG9jayhtZCk7XG4gICAgaWYgKCF5YW1sKSByZXR1cm4ge307XG4gICAgLy8gVHJ5IEpTT04gcGFyc2UgZmlyc3RcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoeWFtbCkgYXMgQ29uc3RpdHV0aW9uRGF0YTtcbiAgICB9IGNhdGNoIChlKSB7IHZvaWQgZTtcbiAgICAgIC8vIEZhbGxiYWNrOiB2ZXJ5IHNtYWxsIHBhcnNlciBmb3Igb3VyIHNpbXBsZSBibG9ja1xuICAgICAgY29uc3Qgb3V0OiBhbnkgPSB7fTtcbiAgICAgIGNvbnN0IGxpbmVzID0geWFtbC5zcGxpdCgvXFxyP1xcbi8pLm1hcCgobCkgPT4gbC5yZXBsYWNlKC9eXFxzKy8sICcnKSk7XG4gIGxldCBjdXJyZW50OiBhbnkgPSBvdXQ7XG4gICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgaWYgKCFsaW5lIHx8IGxpbmUuc3RhcnRzV2l0aCgnIycpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgbSA9IGxpbmUubWF0Y2goL14oW146XSspOig/OlxccyooLiopKT8kLyk7XG4gICAgICAgIGlmICghbSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGtleSA9IG1bMV0udHJpbSgpO1xuICAgICAgICBjb25zdCB2YWwgPSBtWzJdID09PSB1bmRlZmluZWQgfHwgbVsyXSA9PT0gJycgPyB1bmRlZmluZWQgOiBtWzJdLnRyaW0oKTtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY3VycmVudFtrZXldID0ge307XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnRba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB1bnF1b3RlIGlmIHByZXNlbnRcbiAgICAgICAgICBjb25zdCB2ID0gdmFsLnJlcGxhY2UoL15cInxcIiQvZywgJycpO1xuICAgICAgICAgIGN1cnJlbnRba2V5XSA9IHYgPT09ICd0cnVlJyA/IHRydWUgOiB2ID09PSAnZmFsc2UnID8gZmFsc2UgOiB2O1xuICAgICAgICB9XG4gIH1cbiAgICAgIC8vIEVuc3VyZSBjb21tb24gdG9wLWxldmVsIGtleXMgZXhpc3QgZXZlbiBpZiBlbXB0eVxuICAgICAgaWYgKCFvdXQuQWNyb255bXMpIG91dC5BY3JvbnltcyA9IHt9O1xuICAgICAgaWYgKCFvdXQuQnJhbmNoQ29uZmlnKSBvdXQuQnJhbmNoQ29uZmlnID0ge30gYXMgYW55O1xuICAgICAgcmV0dXJuIG91dCBhcyBDb25zdGl0dXRpb25EYXRhO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHdyaXRlKGRhdGE6IENvbnN0aXR1dGlvbkRhdGEpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBtZCA9IGF3YWl0IHRoaXMucmVhZFJhdygpLmNhdGNoKCgpID0+ICcjIFByb2plY3QgQ29uc3RpdHV0aW9uXFxuXFxuJyk7XG4gICAgY29uc3QgeWFtbCA9IHRoaXMuZXh0cmFjdFlhbWxCbG9jayhtZCkgfHwgJyc7XG4gICAgY29uc3QgZXhpc3RpbmcgPSB5YW1sID8geWFtbCA6ICcnO1xuICAgIC8vIE5haXZlIG1lcmdlOiBvdmVyd3JpdGUgQWNyb255bXMvQnJhbmNoQ29uZmlnIGtleXNcbiAgICBjb25zdCBtZXJnZWQ6IGFueSA9IHt9O1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuYXNzaWduKG1lcmdlZCwgSlNPTi5wYXJzZShleGlzdGluZykpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHZvaWQgZTsgLy8gaWdub3JlXG4gICAgfVxuICAgIE9iamVjdC5hc3NpZ24obWVyZ2VkLCBkYXRhIHx8IHt9KTtcbiAgY29uc3QgbmV3WWFtbCA9IEpTT04uc3RyaW5naWZ5KG1lcmdlZCwgbnVsbCwgMik7XG4gIGNvbnN0IG5ld01kID0gbWQuc3BsaXQoJ2BgYCcpWzBdICsgJ1xcbmBgYHlhbWxcXG4nICsgbmV3WWFtbCArICdcXG5gYGBcXG4nO1xuICAgIGF3YWl0IGZzLm1rZGlyKHBhdGguZGlybmFtZSh0aGlzLmZpbGVQYXRoKSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKHRoaXMuZmlsZVBhdGgsIG5ld01kLCAndXRmOCcpO1xuICB9XG5cbiAgYXN5bmMgZ2V0QWNyb255bXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PiB7XG4gICAgY29uc3QgZCA9IGF3YWl0IHRoaXMucmVhZCgpO1xuICAgIHJldHVybiAoZCAmJiAoZC5BY3JvbnltcyBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSkgfHwge307XG4gIH1cblxuICBhc3luYyBzZXRBY3JvbnltcyhtYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5yZWFkKCk7XG4gICAgZGF0YS5BY3JvbnltcyA9IHsgLi4uKGRhdGEuQWNyb255bXMgfHwge30pLCAuLi4obWFwIHx8IHt9KSB9IGFzIGFueTtcbiAgICBhd2FpdCB0aGlzLndyaXRlKGRhdGEpO1xuICB9XG5cbiAgYXN5bmMgZ2V0TWNwRW5hYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkID0gYXdhaXQgdGhpcy5yZWFkKCk7XG4gICAgcmV0dXJuIGQuZGVjYWZNY3BFbmFibGVkID09PSB1bmRlZmluZWQgPyB0cnVlIDogQm9vbGVhbihkLmRlY2FmTWNwRW5hYmxlZCk7XG4gIH1cblxuICBhc3luYyBzZXRNY3BFbmFibGVkKHZhbHVlOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZCA9IGF3YWl0IHRoaXMucmVhZCgpO1xuICAgIGQuZGVjYWZNY3BFbmFibGVkID0gISF2YWx1ZTtcbiAgICBhd2FpdCB0aGlzLndyaXRlKGQpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkQ29uc3RpdHV0aW9uKCk6IFByb21pc2U8Q29uc3RpdHV0aW9uRGF0YT4ge1xuICBjb25zdCBzID0gbmV3IENvbnN0aXR1dGlvblN0b3JlKCk7XG4gIC8vIFByZWZlciB0aGUgbWFya2Rvd24tYmFzZWQgc3RvcmUgKHVwLXRvLWRhdGUgZmVuY2VkIFlBTUwpIGFuZCBmYWxsIGJhY2tcbiAgLy8gdG8gYSBKU09OIHNuYXBzaG90IGlmIHByZXNlbnQuIFRoaXMgZW5zdXJlcyB0aGUgbW9zdC1yZWNlbnQgaHVtYW4tZWRpdGFibGVcbiAgLy8gY29udGVudCBpcyB1c2VkIGJ5IHRoZSB0b29scy90ZXN0cy5cbiAgdHJ5IHtcbiAgICBjb25zdCBtZERhdGEgPSBhd2FpdCBzLnJlYWQoKTtcbiAgICBpZiAobWREYXRhICYmIChtZERhdGEuQWNyb255bXMgfHwgbWREYXRhLkJyYW5jaENvbmZpZyB8fCBtZERhdGEuSmlyYU1hcHBpbmcpKSB7XG4gICAgICByZXR1cm4gbWREYXRhO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHZvaWQgZTsgLy8gaWdub3JlIGFuZCB0cnkgSlNPTiBzbmFwc2hvdFxuICB9XG4gIC8vIEFzIGEgbGFzdCByZXNvcnQsIHRyeSB0byBwYXJzZSBzaW1wbGUsIHVuZmVuY2VkIFlBTUwgYmxvY2tzIGluIHRoZSByYXdcbiAgLy8gY29uc3RpdHV0aW9uIGZpbGUgKHNvbWUgdGVzdHMgd3JpdGUgYSBiYXJlICdgYGB5YW1sJyBibG9jayBvciBwbGFpbiBZQU1MKS5cbiAgdHJ5IHtcbiAgICBjb25zdCByYXcgPSBhd2FpdCByZWFkQ29uc3RpdHV0aW9uRmlsZSgpO1xuICAgIGNvbnN0IG0gPSByYXcubWF0Y2goL0Fjcm9ueW1zOlxccypcXG4oW1xcc1xcU10qPykoPzpcXG5cXFN8JCkvbSk7XG4gICAgaWYgKG0pIHtcbiAgICAgIGNvbnN0IGJsb2NrID0gbVsxXTtcbiAgICAgIGNvbnN0IGFjcjogYW55ID0ge307XG4gICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgYmxvY2suc3BsaXQoL1xccj9cXG4vKSkge1xuICAgICAgICBjb25zdCBsbSA9IGxpbmUubWF0Y2goL15cXHMqKFtcIiddPykoW15cIic6XSspXFwxXFxzKjpcXHMqXCI/KFteXCJcXG5dKylcIj9cXHMqJC8pO1xuICAgICAgICBpZiAobG0pIGFjcltsbVsyXS50cmltKCldID0gbG1bM10udHJpbSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgQWNyb255bXM6IGFjciB9IGFzIENvbnN0aXR1dGlvbkRhdGE7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgdm9pZCBlOyAvLyBpZ25vcmVcbiAgfVxuICBjb25zdCBqc29uUGF0aCA9IHBhdGgucmVzb2x2ZSgnLnNwZWNpZnknLCAnbWVtb3J5JywgJ2NvbnN0aXR1dGlvbi5qc29uJyk7XG4gIHRyeSB7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgZnMucmVhZEZpbGUoanNvblBhdGgsICd1dGY4Jyk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UocmF3KSBhcyBDb25zdGl0dXRpb25EYXRhO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdm9pZCBlOyAvLyBmaW5hbCBmYWxsYmFjayB0byBlbXB0eVxuICB9XG4gIHJldHVybiB7fSBhcyBDb25zdGl0dXRpb25EYXRhO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVDb25zdGl0dXRpb24oZGF0YTogQ29uc3RpdHV0aW9uRGF0YSk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBzID0gbmV3IENvbnN0aXR1dGlvblN0b3JlKCk7XG4gIHJldHVybiBzLndyaXRlKGRhdGEpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWNyb255bXMoKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PiB7XG4gIGNvbnN0IHMgPSBuZXcgQ29uc3RpdHV0aW9uU3RvcmUoKTtcbiAgcmV0dXJuIHMuZ2V0QWNyb255bXMoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBhcnNlQWNyb255bXNGcm9tRmlsZShmaWxlUGF0aD86IHN0cmluZyk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4ge1xuICBjb25zdCBwID0gZmlsZVBhdGggfHwgcGF0aC5yZXNvbHZlKCcuc3BlY2lmeScsICdtZW1vcnknLCAnY29uc3RpdHV0aW9uLm1kJyk7XG4gIHRyeSB7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgZnMucmVhZEZpbGUocCwgJ3V0ZjgnKTtcbiAgICAvLyBQcmVmZXIgbWFya2VkIGJsb2NrXG4gICAgY29uc3QgbWFya2VycyA9IGV4dHJhY3RBY3Jvbnltc0Jsb2NrKHJhdyk7XG4gICAgbGV0IGJsb2NrID0gbWFya2Vycy5ibG9jaztcbiAgICBpZiAoIWJsb2NrKSB7XG4gICAgICBjb25zdCBtID0gcmF3Lm1hdGNoKC9gYGAoPzp5YW1sfHltbClcXHMqXFxuKFtcXHNcXFNdKj8pXFxuYGBgL20pO1xuICAgICAgaWYgKG0pIGJsb2NrID0gbVsxXTtcbiAgICB9XG4gICAgaWYgKCFibG9jaykgcmV0dXJuIHt9O1xuICAgIGNvbnN0IGxpbmVzID0gYmxvY2suc3BsaXQoL1xccj9cXG4vKS5tYXAobCA9PiBsLnJlcGxhY2UoL15cXHMrLywgJycpKTtcbiAgICBjb25zdCBhY3I6IFJlY29yZDxzdHJpbmcsc3RyaW5nPiA9IHt9O1xuICAgIGxldCBpbkFjciA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgaWYgKCFsaW5lKSBjb250aW51ZTtcbiAgICAgIGlmICgvXkFjcm9ueW1zXFxzKjovaS50ZXN0KGxpbmUpKSB7IGluQWNyID0gdHJ1ZTsgY29udGludWU7IH1cbiAgICAgIGlmICgvXlxcdy8udGVzdChsaW5lKSAmJiBpbkFjciAmJiAhL15cXHMvLnRlc3QobGluZSkpIGJyZWFrO1xuICAgICAgaWYgKGluQWNyKSB7XG4gICAgICAgIGNvbnN0IGt2ID0gbGluZS5tYXRjaCgvXlwiPyhbXlwiOl0rKVwiP1xccyo6XFxzKlwiPyhbXlwiXFxuXSspXCI/Lyk7XG4gICAgICAgIGlmIChrdikgYWNyW2t2WzFdLnRyaW0oKV0gPSBrdlsyXS50cmltKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhY3I7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB2b2lkIGU7XG4gICAgcmV0dXJuIHt9O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbnN0aXR1dGlvblN0b3JlO1xuIFxuXG5cblxuIl19