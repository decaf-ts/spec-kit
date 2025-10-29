import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { runConfigureAcronyms } from '../../src/cli/configureAcronyms';
import ConstitutionStore from '../../src/lib/constitution';

describe('configureAcronyms CLI', () => {
  let tmpDir: string;
  let filePath: string;

  const sampleMd = [
    '# Test Constitution',
    '',
    '```yaml',
    'decafMcpEnabled: true',
    '',
    'Acronyms:',
    '  Requirement: REQ',
    '  User Story: USR',
    '  Feature: FTR',
    '```',
    ''
  ].join('\n');

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cfg-'));
  const memDir = path.join(tmpDir, '.specify', 'memory');
  await fs.mkdir(memDir, { recursive: true });
  filePath = path.join(memDir, 'constitution.md');
  await fs.writeFile(filePath, sampleMd, 'utf8');
  // override cwd so ConstitutionStore uses this repo root path
  process.chdir(tmpDir);
  });

  afterEach(async () => {
    try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch (e) { void e; }
  });

  test('dry-run returns mapping without applying', async () => {
    const res = await runConfigureAcronyms({ dryRun: true });
    expect(res.applied).toBe(false);
    expect(res.mapping['Requirement']).toBe('REQ');
  });

  test('apply persists mapping', async () => {
    const res = await runConfigureAcronyms({ apply: true, mapping: { 'Requirement': 'RQX' } });
    expect(res.applied).toBe(true);
  const store = new ConstitutionStore(path.join(tmpDir, '.specify', 'memory', 'constitution.md'));
    const acr = await store.getAcronyms();
    expect(acr.Requirement).toBe('RQX');
  });
});
