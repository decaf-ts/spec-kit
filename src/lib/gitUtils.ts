import { execSync } from 'child_process';

export function runGit(cmd: string, cwd?: string): string {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf8', cwd }).toString().trim();
  } catch (e: any) {
    throw new Error(`git ${cmd} failed: ${e && e.message ? e.message : String(e)}`);
  }
}

export function currentBranch(cwd?: string): string {
  try {
    return runGit('rev-parse --abbrev-ref HEAD', cwd);
  } catch {
    return 'HEAD';
  }
}

export function createBranch(name: string, cwd?: string, from?: string): string {
  const base = from ? ` ${from}` : '';
  runGit(`checkout -b ${name}${base}`, cwd);
  return name;
}

export function commitAll(message = 'chore: apply acronym updates', cwd?: string): string {
  try {
    runGit('add -A', cwd);
    runGit(`commit -m "${message.replace(/"/g, '\\"')}"`, cwd);
    return runGit('rev-parse --short HEAD', cwd);
  } catch (e) {
    void e;
    return '';
  }
}

export default { runGit, currentBranch, createBranch, commitAll };
