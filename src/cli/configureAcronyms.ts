import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ensureAcronymsBlock, readConstitution, writeConstitution } from '../lib/constitution';

export interface ConfigureOptions {
  dryRun?: boolean;
  apply?: boolean;
  mapping?: Record<string, string>;
}

export async function runConfigureAcronyms(opts: ConfigureOptions = {}): Promise<{ applied: boolean; mapping: Record<string,string> }>{
  await ensureAcronymsBlock();
  const existing = await readConstitution();
  const mapping = { ...(existing.Acronyms || {}), ...(opts.mapping || {}) };

  if (opts.dryRun) {
    // return plan without writing
    return { applied: false, mapping };
  }

  if (opts.apply) {
  existing.Acronyms = mapping;
  await writeConstitution(existing);
    return { applied: true, mapping };
  }

  // Interactive mode
  const rl = readline.createInterface({ input, output });
  try {
    console.log('Configure Acronyms - interactive mode');
    console.log('Press enter to accept existing value in brackets.');

    for (const key of ['Requirement','User Story','Feature','Scoring']) {
      const current = mapping[key] || '';
      const answer = await rl.question(`${key} acronym [${current}]: `);
      if (answer && answer.trim()) mapping[key] = answer.trim();
    }

    const confirm = await rl.question('Apply changes? (yes/no): ');
    if (/^y/i.test(confirm)) {
  existing.Acronyms = mapping;
  await writeConstitution(existing);
      console.log('Acronyms saved to constitution.');
      return { applied: true, mapping };
    }

    console.log('No changes applied.');
    return { applied: false, mapping };
  } finally {
    rl.close();
  }
}

export default runConfigureAcronyms;
