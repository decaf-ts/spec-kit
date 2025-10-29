/**
 * Minimal MCP/Jira wrapper: attempts to use @decaf-ts/mcp-server if available,
 * otherwise falls back to a local pending response.
 */
import type { JiraMapping } from '../types/acronyms';

export async function createIssue(
  summary: string,
  mapping?: JiraMapping,
): Promise<{ issueKey?: string; status: string }> {
  try {
    // dynamic import to avoid a hard dependency
     
    const mcp = await import('@decaf-ts/mcp-server');
    if (mcp && typeof (mcp as any).createIssue === 'function') {
      const res = await (mcp as any).createIssue({ summary, mapping });
      return { issueKey: res?.key, status: 'created' };
    }
  } catch (_e) {
    void _e; // intentionally ignore import/remote errors
  }

  // local fallback when MCP/Jira isn't available
  return { status: 'pending' };
}

export default { createIssue };
