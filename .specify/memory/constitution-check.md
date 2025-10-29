# Constitution Compliance Check

Date: 2025-10-28

This file records the results of the constitution compliance checks run as
part of the feature setup for `specs/001-configurable-acronyms-jira-integration`.

Summary
-------

- `decafMcpEnabled` present in `.specify/memory/constitution.md`: ✓ (true)
- MCP discovery artifact `.specify/memory/mcp-tools.md` present: ✓ (placeholder)
- `@decaf-ts/mcp-server` available/resolvable: ✗ (not installed / placeholder)
- Constitution requirement: All MCP-dependent operations MUST be performed
  through `@decaf-ts/mcp-server` and an MCP discovery MUST be completed.

Result: FAIL (MCP discovery incomplete / package not resolvable)

Details & recommended remediation
-------------------------------

1. The MCP discovery script was executed but `@decaf-ts/mcp-server` was not
   resolvable in the environment. As a result, `.specify/memory/mcp-tools.md`
   contains a placeholder explaining how to install the package and run
   discovery.

2. Because the authoritative list of permitted persistence/UI frameworks is
   provided by MCP discovery, the plan-level Constitution Check cannot be fully
   completed until real discovery output exists.

3. Remediation steps:
   - Install `@decaf-ts/mcp-server` in the project (or ensure it is resolvable
     in the environment): `npm install --save @decaf-ts/mcp-server`
   - Re-run `.specify/scripts/run-mcp-discovery.js` or the provided setup
     script to populate `.specify/memory/mcp-tools.md` with live data.
   - Re-run this constitution check (or open a PR referencing the populated
     `mcp-tools.md`) so T004 can be marked PASS.

Recorded-by: automation (run-mcp-discovery.js)
