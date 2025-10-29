import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

describe('updateAcronyms integration (basic)', () => {
  test('dry-run and apply in a temp git repo', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'update-'));
    const repo = tmp;
    // init git
    execSync('git init', { cwd: repo });
    // create a sample file with tokens
    const memDir = path.join(repo, '.specify', 'memory');
    await fs.mkdir(memDir, { recursive: true });
    const constitution = [
      '```yaml',
      'Acronyms:',
      '  User Story: USR',
      '```',
      ''
    ].join('\n');
    await fs.writeFile(path.join(memDir, 'constitution.md'), constitution, 'utf8');

    const filePath = path.join(repo, 'TEMPLATE.md');
    await fs.writeFile(filePath, 'This is {{ACRONYM:User Story}}-1', 'utf8');
    execSync('git add -A && git commit -m init', { cwd: repo });

  // run the CLI dry-run
  const cli = path.resolve('./src/cli/updateAcronyms.ts');
    // Node can run TS files via ts-node in dev env; here we run via node if compiled.
    // We'll call the main script via node with require-hook disabled; instead, call the compiled JS if available.
    // For integration test we will directly import the module and call exported function if possible.
    // As a fallback, just ensure the dry-run file is generated when running the main script with node via ts-node if available.

    // Attempt to run via node directly (platform may have ts-node/register configured in tests environment)
    try {
      execSync(`node ${cli} --dry-run --target=${repo}`, { cwd: process.cwd(), stdio: 'inherit' });
    } catch (e) {
      void e;
      // ignore failures here; the presence of the output JSON is the assertion
    }

    const out = path.join(process.cwd(), 'specs/001-configurable-acronyms-jira-integration/update-acronyms-dryrun.json');
    const exists = await fs.stat(out).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    // Now run apply mode and verify result JSON and commit
    try {
      execSync(`node ${cli} --apply --target=${repo}`, { cwd: process.cwd(), stdio: 'inherit' });
    } catch (e) {
      void e;
      // ignore; we'll check outputs
    }

    const outApply = path.join(process.cwd(), 'specs/001-configurable-acronyms-jira-integration/update-acronyms-result.json');
    const existsApply = await fs.stat(outApply).then(() => true).catch(() => false);
    expect(existsApply).toBe(true);

    // verify the file in the repo has been replaced (USR applied)
    const changed = await fs.readFile(filePath, 'utf8');
    expect(changed).toContain('USR-1');
  }, 20000);
});
