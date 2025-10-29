#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import { generateDryRunJson, scanForAcronymTokens, applyReplacements } from '../lib/updateScanner';
import { currentBranch, createBranch, commitAll } from '../lib/gitUtils';

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const apply = args.includes('--apply');
  const targetArg = args.find(a => a.startsWith('--target='));
  const branchArg = args.find(a => a.startsWith('--branch='));
  const target = targetArg ? targetArg.split('=')[1] : process.cwd();
  const branch = branchArg ? branchArg.split('=')[1] : `chore/update-acronyms-${Date.now()}`;

  const summaries = await scanForAcronymTokens(path.resolve(target));

  const outDir = path.resolve('specs/001-configurable-acronyms-jira-integration');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'update-acronyms-dryrun.json');

  const result = {
    changedFiles: summaries.map(s => s.file),
    summary: summaries.map(s => ({ file: s.file, replacements: s.replacements })),
    timestamp: new Date().toISOString(),
  };
  await fs.writeFile(outPath, JSON.stringify(result, null, 2), 'utf8');

  console.log('Dry-run result written to', outPath);

  if (apply) {
    // create branch, apply replacements, commit
    createBranch(branch);
    await applyReplacements(summaries);
    const commitHash = commitAll('chore: apply acronym replacements');
    const final = { ...result, branch, commitHash };
    const outApply = path.join(outDir, 'update-acronyms-result.json');
    await fs.writeFile(outApply, JSON.stringify(final, null, 2), 'utf8');
    console.log('Applied changes on branch', branch, 'commit', commitHash);
  }
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}

export default main;
