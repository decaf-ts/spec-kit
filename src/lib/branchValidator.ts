import type { BranchConfig } from '../types/acronyms';

export function validateBranchName(branchName: string, config?: BranchConfig): boolean {
  if (!branchName) return false;
  const name = branchName.trim();
  if (config && config.enforcePattern) {
    try {
      const re = new RegExp(config.enforcePattern);
      return re.test(name);
    } catch (e) {
        void e; // invalid pattern; fall back
    }
  }
  if (config && config.branchAcronym) {
    return name.startsWith(config.branchAcronym + '-') || name.includes(config.branchAcronym + '-');
  }
  // default pattern: contains a dash and an uppercase prefix like SPEC-123
  return /[A-Z]+-\d+/.test(name);
}

export default { validateBranchName };
