import { createIssue } from '../../src/lib/jira';

describe('jira wrapper', () => {
  test('fallback returns pending when MCP not available', async () => {
    const res = await createIssue('Test issue');
    expect(res.status).toBe('pending');
  });
});
