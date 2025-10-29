import { readConstitution, writeConstitution, ensureAcronymsBlock } from '../../src/lib/constitution';
import { promises as fs } from 'fs';
import path from 'path';

describe('constitution store', () => {
  const jsonPath = path.resolve('.specify/memory/constitution.json');
  afterEach(async () => {
    try { await fs.unlink(jsonPath); } catch (e) {}
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
    } catch {}
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
