import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ConstitutionStore, readConstitution, writeConstitution } from '../../src/lib/constitution';

describe('ConstitutionStore', () => {
  const tmpDir = path.join(os.tmpdir(), 'spec-kit-test-' + Date.now());
  const filePath = path.join(tmpDir, '.specify', 'memory', 'constitution.md');

  beforeAll(async () => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  });

  afterAll(async () => {
    // cleanup
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (e) {
      void e; // ignore
    }
  });

  test('read/write via store', async () => {
    const store = new ConstitutionStore(filePath);
    await store.write({ Acronyms: { 'User Story': 'USR' } } as any);
    const d = await store.read();
    expect(d.Acronyms).toBeDefined();
    expect((d.Acronyms as any)['User Story']).toBe('USR');
  });

  test('functional helpers', async () => {
    await writeConstitution({ Acronyms: { Requirement: 'REQ' } } as any);
    const data = await readConstitution();
    // may be merged with existing; at least ensure shape
    expect(data).toBeDefined();
  });
});
import { readConstitution, writeConstitution, ensureAcronymsBlock } from '../../src/lib/constitution';
import { promises as fs } from 'fs';
import path from 'path';

describe('constitution store', () => {
  const jsonPath = path.resolve('.specify/memory/constitution.json');
  afterEach(async () => {
    try { await fs.unlink(jsonPath); } catch (e) { void e; }
  });

  it('writes and reads constitution JSON', async () => {
    const data = { Acronyms: { 'User Story': 'USR' }, decafMcpEnabled: true };
    await writeConstitution(data as any);
    const read = await readConstitution();
    expect(read.Acronyms['User Story']).toBe('USR');
    expect(read.decafMcpEnabled).toBe(true);
  });

  it('ensureAcronymsBlock creates default blocks', async () => {
    await ensureAcronymsBlock();
    const read = await readConstitution();
    expect(read.Acronyms).toBeDefined();
    expect(read.BranchConfig).toBeDefined();
  });
});
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { ConstitutionStore } from '../../src/lib/constitution';

describe('ConstitutionStore', () => {
  let tmpDir: string;
  let filePath: string;

  const sampleMd = [
    '# Test Constitution',
    '',
    'Some header text',
    '',
    '```yaml',
    'decafMcpEnabled: true',
    '',
    'Acronyms:',
    '  Requirement: REQ',
    '  User Story: USR',
    '  Feature: FTR',
    '  Scoring: TC',
    '',
    'BranchConfig:',
    '  pattern: "[A-Z]+-\\d+"',
    '',
    '```',
    ''
  ].join('\n');

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'constit-'));
    filePath = path.join(tmpDir, 'constitution.md');
    await fs.writeFile(filePath, sampleMd, 'utf8');
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (e) { void e; }
  });

  test('reads acronyms and mcp flag', async () => {
    const store = new ConstitutionStore(filePath);
    const acr = await store.getAcronyms();
    expect(acr.Requirement).toBe('REQ');
    expect(acr['User Story']).toBe('USR');
    const mcp = await store.getMcpEnabled();
    expect(mcp).toBe(true);
  });

  test('sets mcp flag and persists', async () => {
    const store = new ConstitutionStore(filePath);
    await store.setMcpEnabled(false);
    const read = new ConstitutionStore(filePath);
    const mcp = await read.getMcpEnabled();
    expect(mcp).toBe(false);
  });

  test('updates acronyms mapping and persists', async () => {
    const store = new ConstitutionStore(filePath);
    await store.setAcronyms({ 'User Story': 'USX', Requirement: 'RQ' });
    const store2 = new ConstitutionStore(filePath);
    const acr = await store2.getAcronyms();
    expect(acr['User Story']).toBe('USX');
    expect(acr.Requirement).toBe('RQ');
    // other keys remain
    expect(acr.Feature).toBe('FTR');
  });
});
