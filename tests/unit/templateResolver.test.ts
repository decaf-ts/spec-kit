import { resolveTemplate, resolveAcronymToken } from '../../src/lib/templateResolver';

describe('templateResolver', () => {
  const constData = {
    Acronyms: {
      'User Story': 'USR',
      Requirement: 'REQ',
    },
  } as any;

  test('resolves simple token', () => {
    const out = resolveTemplate('This is {{ACRONYM:User Story}}-1', constData);
    expect(out).toBe('This is USR-1');
  });

  test('fallback builds initials when not present', () => {
    const out = resolveTemplate('Use {{ACRONYM:Scoring Criteria}}-1', constData);
    // Scoring Criteria -> SC
    expect(out).toMatch(/SC/);
  });

  test('resolveAcronymToken returns direct acronym if short', () => {
    expect(resolveAcronymToken('usr', constData)).toBe('USR');
  });
});
import { resolveTemplate } from '../../src/lib/templateResolver';

describe('templateResolver', () => {
  it('replaces acronym tokens using constitution data', () => {
    const template = 'Title: {{ACRONYM:User Story}}-1';
    const constData = { Acronyms: { 'User Story': 'USR' } };
    const out = resolveTemplate(template, constData as any);
    expect(out).toBe('Title: USR-1');
  });

  it('falls back to token text when acronym not found', () => {
    const template = 'Thing: {{ACRONYM:Unknown}}-1';
    const constData = { Acronyms: { } };
    const out = resolveTemplate(template, constData as any);
    expect(out).toBe('Thing: Unknown-1');
  });
});
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import ConstitutionStore from '../../src/lib/constitution';
import { resolveAcronymsInText } from '../../src/lib/templateResolver';

describe('templateResolver', () => {
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
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'templ-'));
    filePath = path.join(tmpDir, 'constitution.md');
    await fs.writeFile(filePath, sampleMd, 'utf8');
  });

  afterEach(async () => {
    try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch (e) { void e; }
  });

  test('resolves known acronyms', async () => {
    const store = new ConstitutionStore(filePath);
    const inText = 'This is {{ACRONYM:User Story}}-1 and {{ACRONYM:Requirement}}-2.';
    const resolved = await resolveAcronymsInText(inText, store);
    expect(resolved).toContain('USR-1');
    expect(resolved).toContain('REQ-2');
  });

  test('falls back to initials for unknown acronym', async () => {
    const store = new ConstitutionStore(filePath);
    const inText = 'New token {{ACRONYM:Integration Test}}-5';
    const resolved = await resolveAcronymsInText(inText, store);
    // Integration Test -> IT (initials up to 3 -> 'IT')
    expect(resolved).toContain('IT-5');
  });

  test('resolves multiple occurrences', async () => {
    const store = new ConstitutionStore(filePath);
    const inText = '{{ACRONYM:Feature}} and again {{ACRONYM:Feature}}';
    const resolved = await resolveAcronymsInText(inText, store);
    expect(resolved).toBe('FTR and again FTR');
  });
});
