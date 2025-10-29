import { validateBranchName } from '../../src/lib/branchValidator';

describe('branchValidator', () => {
  test('default accepts SPEC-123', () => {
    expect(validateBranchName('SPEC-123')).toBe(true);
  });

  test('respects enforcePattern', () => {
    expect(validateBranchName('feature/abc', { enforcePattern: '^feature/' })).toBe(true);
    expect(validateBranchName('bug/123', { enforcePattern: '^feature/' })).toBe(false);
  });
});
