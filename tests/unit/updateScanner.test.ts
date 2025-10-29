import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

// mock constitution read to provide acronyms
jest.mock('../../src/lib/constitution', () => ({
  readConstitution: jest.fn().mockResolvedValue({ Acronyms: { NASA: 'National Aeronautics and Space Administration' } }),
}));

import { listFiles, scanForAcronymTokens, generateDryRunJson, applyReplacements } from '../../src/lib/updateScanner';

describe('updateScanner', () => {
  let tmp: string;
  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'updateScanner-'));
  });
  afterEach(async () => {
    // remove temp dir recursively
    await fs.rm(tmp, { recursive: true, force: true });
  });

  test('listFiles finds markdown files', async () => {
    const f1 = path.join(tmp, 'a.md');
    const f2 = path.join(tmp, 'b.txt');
    await fs.writeFile(f1, 'hello', 'utf8');
    await fs.writeFile(f2, 'world', 'utf8');
    const files = await listFiles(tmp);
    expect(files.map(p => path.resolve(p)).sort()).toEqual([path.resolve(f1), path.resolve(f2)].sort());
  });

  test('scanForAcronymTokens and generateDryRunJson detect tokens', async () => {
    const f = path.join(tmp, 'with.md');
    await fs.writeFile(f, 'This mentions {{ACRONYM: NASA}} in text', 'utf8');
    const summary = await scanForAcronymTokens(tmp);
    expect(summary.find(s => path.resolve(s.file) === path.resolve(f))?.replacements).toBe(1);

    const out = path.join(tmp, 'out', 'dry.json');
    const res = await generateDryRunJson(tmp, out);
    const written = JSON.parse(await fs.readFile(out, 'utf8'));
    expect(written.changedFiles.length).toBeGreaterThan(0);
    expect(res.changedFiles.length).toBeGreaterThan(0);
  });

  test('applyReplacements replaces tokens in files', async () => {
    const f = path.join(tmp, 'replace.md');
    await fs.writeFile(f, 'Value: {{ACRONYM: NASA}}', 'utf8');
    const res = await applyReplacements(tmp);
    expect(res.changedFiles.length).toBe(1);
    const content = await fs.readFile(f, 'utf8');
    expect(content).toContain('National Aeronautics and Space Administration');
  });
});
