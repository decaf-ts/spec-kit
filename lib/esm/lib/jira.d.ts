/**
 * Minimal MCP/Jira wrapper: attempts to use @decaf-ts/mcp-server if available,
 * otherwise falls back to a local pending response.
 */
import type { JiraMapping } from '../types/acronyms';
export declare function createIssue(summary: string, mapping?: JiraMapping): Promise<{
    issueKey?: string;
    status: string;
}>;
declare const _default: {
    createIssue: typeof createIssue;
};
export default _default;
