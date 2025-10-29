# Constitution Issues & Required Approvals

Date: 2025-10-28

This document records any constitution-related blockers discovered during the
setup/constitution check for the feature `001-configurable-acronyms-jira-integration`.

Issue: MCP discovery not completed / `@decaf-ts/mcp-server` unavailable
---------------------------------------------------------------

Description:

The constitution mandates that MCP discovery be performed during setup and
that all MCP-dependent operations use `@decaf-ts/mcp-server`. During our
initial attempt an MCP discovery placeholder was written because the package
could not be resolved in the local environment.

Impact:

- Cannot verify permitted persistence/UI frameworks. This blocks automated
  gating that would allow or disallow certain tech choices.
- Any tasks that require MCP (Jira integration, automated agent orchestration)
  must not be executed until MCP discovery is available and verified.

Required action(s):

1. Install or make `@decaf-ts/mcp-server` available in the environment where
   the setup step runs (developer machine / CI). Suggested command:

   ```bash
   npm install --save @decaf-ts/mcp-server
   ```

2. Re-run the provided discovery script:

   ```bash
   node .specify/scripts/run-mcp-discovery.js
   ```

3. Review the generated `.specify/memory/mcp-tools.md` and confirm the list
   of supported frameworks/persistence. If any planned technologies are not
   listed, create a proposal in `/workdocs/constitution/amendments/` and follow
   the amendment process.

Approval note:

If the organization cannot provide MCP in CI or developer environments, a
formal constitution amendment is required to allow a documented, auditable
fallback strategy for specific operations (for example: local numbering for
Jira fallbacks). See `CONTRIBUTION` and `Governance` sections in
`.specify/memory/constitution.md` for the amendment workflow.

Recorded-by: automation (constitution-check)
