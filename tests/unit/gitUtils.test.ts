import * as child from 'child_process';
import * as gitUtils from '../../src/lib/gitUtils';

jest.mock('child_process');

describe('gitUtils', () => {
  const execSyncMock = child.execSync as jest.MockedFunction<typeof child.execSync>;

  beforeEach(() => {
    execSyncMock.mockReset();
  });

  test('runGit returns trimmed output on success', () => {
    execSyncMock.mockReturnValueOnce('  ok\n');
    const out = gitUtils.runGit('status');
    expect(out).toBe('ok');
    expect(execSyncMock).toHaveBeenCalledWith('git status', expect.any(Object));
  });

  test('currentBranch returns branch name or HEAD on error', () => {
    execSyncMock.mockReturnValueOnce('main\n');
    expect(gitUtils.currentBranch()).toBe('main');

    execSyncMock.mockImplementationOnce(() => { throw new Error('no git'); });
    expect(gitUtils.currentBranch()).toBe('HEAD');
  });

  test('createBranch calls git checkout -b and returns name', () => {
    execSyncMock.mockReturnValue('');
    const name = gitUtils.createBranch('feature/test', undefined, 'main');
    expect(name).toBe('feature/test');
    expect(execSyncMock).toHaveBeenCalledWith('git checkout -b feature/test main', expect.any(Object));
  });

  test('commitAll returns short hash when successful and empty on failure', () => {
    // Sequence: add, commit, rev-parse
    execSyncMock.mockImplementation((cmd: string) => {
      if ((cmd as string).includes('rev-parse --short HEAD')) return 'abc123\n';
      return '';
    });
    const h = gitUtils.commitAll('msg');
    expect(h).toBe('abc123');

    // Simulate commit throwing
    execSyncMock.mockImplementationOnce(() => '').mockImplementationOnce(() => { throw new Error('commit failed'); });
    const h2 = gitUtils.commitAll('msg');
    expect(h2).toBe('');
  });
});
