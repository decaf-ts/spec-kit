declare module '@decaf-ts/mcp-server' {
  // minimal ambient declarations to allow dynamic import in the CLI
  export function createIssue(opts: { summary: string; mapping?: any }): Promise<{ key?: string }>; 
  const _default: { createIssue: typeof createIssue };
  export default _default;
}
