# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

Based on the repository contents and the feature scope, the following technical
context is chosen. Any deviations require explicit justification in the
Constitution Check section.

- **Language/Version**: Node.js >=20 (primary repo tooling & CLI) and Python >=3.11
  (for `specify` CLI utilities). These are inferred from `package.json` (engines)
  and `pyproject.toml`.
- **Primary Dependencies**: `@decaf-ts/mcp-server` (MCP orchestration and Jira
  integrations), Node tooling (jest, eslint), and `typer`/`rich` on the Python
  side for CLI interactions. Templates remain markdown-based.
- **Storage**: File-based memory under `memory/` and `.specify/memory/` (e.g.,
  `memory/constitution.md`). No external DB required for this feature.
- **Testing**: `jest` for JS/TS unit and integration tests; Python tests (if any)
  use `pytest`. The update flow must include tests for dry-run and apply modes.
- **Target Platform**: Linux (CI and developer machines). Cross-platform
  compatibility is desirable but Linux is primary for CI validation.
- **Project Type**: CLI / library (tooling to run within consumer projects). The
  implementation will be packaged as CLI command(s) and library functions.
- **Performance Goals**: Not performance sensitive; operations are file I/O and
  network calls to Jira/MCP. Target: responsive UX (sub-second local ops), and
  reasonable batch update throughput (able to scan ~100 files in < 30s dry-run
  on typical dev machines).
- **Constraints**: Must obey constitution rules (no automated edits to source
  outside allowed directories without explicit approval). All MCP interactions
  must use `@decaf-ts/mcp-server` per constitution.
- **Scale/Scope**: Feature applies to repository-level docs and templates; expected
  to operate on projects of small-to-medium size (tens-to-low-hundreds of spec
  files) for the migration flow.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates (evaluated against `.specify/memory/constitution.md`):

1. MCP usage (Principle I): PASS — Design mandates `@decaf-ts/mcp-server` for
  Jira/auth orchestration and discovery. All agent/Jira interactions will be
  performed through the MCP server.
2. Framework-supported tech only (Principle II): PASS (provisional) — chosen
  technologies (Node >=20, Python >=3.11, `@decaf-ts/*` libs) are consistent
  with the Decaf ecosystem. Final compliance requires an MCP discovery step to
  enumerate allowed persistence/UI frameworks; this will be performed in Phase 0
  and any deviation will be documented as an exception.
3. Controlled file modifications (Principle IV): PASS — the update flow will
  default to `--dry-run` and require explicit confirmation before applying
  edits; modifications to code outside `templates/` and `.specify/memory/` will
  require a manual approval step recorded in the plan/PR.

Result: Gate checks PASS provisionally. Phase 0 research will run MCP discovery
to finalize permitted technologies and confirm there are no constitution
violations. Any unresolved violation will block Phase 0->Phase 1 progression.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
