# research.md

This document captures research decisions and rationale required to resolve
previous "NEEDS CLARIFICATION" markers and to ground Phase 1 design.

## Decision: Languages & Runtime

- Decision: Use Node.js >=20 as the primary runtime for repository tooling and
  CLI features; continue Python >=3.11 support for `specify` CLI utilities.
- Rationale: `package.json` declares Node >=20 and `pyproject.toml` declares
  Python >=3.11. Maintaining both covers JS/TS-first tooling and the existing
  `specify` Python CLI.
- Alternatives considered: Single-language rewrite (all-Node or all-Python). Rejected
  due to high migration cost and existing tooling/tests in both ecosystems.

## Decision: MCP & Jira integration

- Decision: All Jira/auth/agent orchestration will use `@decaf-ts/mcp-server`.
- Rationale: Constitution mandates MCP usage; spec explicitly references the
  Decaf MCP server. Using MCP ensures consistent authentication, auditing, and
  tool discovery.
- Alternatives: Direct Jira API calls from CLI. Rejected because it violates
  constitution principle I and disperses authentication logic.

## Decision: Storage & Persistence

- Decision: Persist acronym configuration and branch mapping in
  `memory/constitution.md` (file-based). No external DB required.
- Rationale: Feature is configuration-oriented and repository-local. Constitution
  already uses `memory/constitution.md` for governance artifacts.

## Decision: Templates & Placeholders

- Decision: Update templates to use dynamic placeholders such as
  `{{ACRONYM:Requirement}}-{{NUMBER}}` and provide a small template resolver
  utility in the CLI to render placeholders during generation/migration.
- Rationale: This avoids hard-coded acronyms and facilitates runtime substitution
  during `speckit.updateAcronyms` and new spec generation.

## Decision: Update Flow Behaviour

- Decision: `speckit.updateAcronyms` will offer `--dry-run` (default for CI/tests),
  `--apply` for interactive mode, and `--branch <name>` to customize branch name.
  When `--apply` is used and files change, the command creates a feature branch
  (default `chore/update-acronyms` with timestamp suffix), commits changes, and
  writes a constitution version bump entry in `memory/constitution.md`.
- Rationale: Matches requirements ACR-007 and ACR-008 and ensures atomic change
  sets for review.

## Decision: Branch Naming & Jira Mapping

- Decision: Branch naming enforcement will prefer using a Jira key (when
  available) and otherwise fall back to local sequence numbers. A mapping
  `Acronym -> JiraIssueType` will be stored in constitution and used to request
  Jira issue creation via MCP.
- Rationale: Aligns with acceptance criteria and decisions in the spec.

## Tests & Validation

- Decision: Provide unit tests for the placeholder resolver, dry-run file
  scanning logic (sample templates & spec files), and integration tests for the
  branch/commit flow using a temporary Git repo fixture. Use `jest` (Node) and
  pytest for Python-side utilities where applicable.
- Rationale: Tests are required by constitution quality gates and ensure safe
  migrations.

## MCP Discovery & Outstanding Checks

- Action: Run an MCP discovery step in Phase 0 to enumerate allowed persistence
  and UI frameworks. This confirms Principle II compliance.

---

All of the above resolves the prior NEEDS CLARIFICATION entries in the plan and
provides concrete guidance for Phase 1 design and contract generation.
# Research: Technical Clarifications

This document resolves the `NEEDS CLARIFICATION` items from the implementation plan's Technical Context for the "Configurable Acronyms & Jira Integration" feature.

## Decisions (summary)

- Decision: Language/Platform — TypeScript targeting Node.js (Node 20+, TypeScript 5+).
  - Rationale: The repository is TypeScript/Node-based (contains `package.json`, `tsconfig.json`, `jest.config.ts`). Using the existing stack minimizes friction and integrates with current tooling (jest, eslint, ts-node).
  - Alternatives considered: Python or Rust (rejected because the repo and contributor workflows target Node/TS).

- Decision: Primary Dependencies — keep lightweight CLI + utility libs:
  - `typescript`, `ts-node` (dev), `jest` (tests), `commander` or `yargs` (CLI), `@decaf-ts/mcp-server` (optional integration), `fs-extra` for safe FS ops.
  - Rationale: Aligns with existing project practices; `@decaf-ts/mcp-server` is already referenced in constitution and should be first-class optional integration.
  - Alternatives: Rolling a bespoke CLI parser (rejected — use `commander`/`yargs` for reliability and testability).

- Decision: Storage — File-system based (`memory/constitution.md`, `templates/`, in-repo spec files). No DB required.
  - Rationale: All constitution and templates are stored in repo. Changes are versioned via git which meets the requirement to create feature branches and commits for updates.
  - Alternatives: External DB or remote store (rejected as overkill for this feature; external stores introduce auth/availability complexity).

- Decision: Testing — `jest` with TypeScript support (ts-jest or using build step). Provide unit tests and a small integration test for the update flow.
  - Rationale: Repo already includes `jest.config.ts` and jest-based tests.

- Decision: Target Platform — developer machines and CI runners (Linux / GitHub Actions). CLI must run on Linux/macOS; Windows support via Git Bash/WSL documented but not required for MVP.
  - Rationale: Project CI uses GitHub Actions and contributors use Linux (repo top-level environment shows Linux). Keep cross-platform considerations minimal for MVP.

- Decision: Project Type — monorepo-style single Node CLI/library package (no separate frontend/backend). Place CLI code under `src/cli` or `src/commands`.
  - Rationale: Matches existing repo layouts and simplifies packaging and tests.

- Decision: Performance Goals — none strict for MVP. The update operation should be performant on typical repo sizes (scan of templates + specs); aim for < 10s on medium repos (100 files) but allow streaming/dry-run to avoid blocking.
  - Rationale: This is largely an I/O & text-replacement operation; optimization can be done later if needed.

- Decision: Constraints — preserve manual edits by default; require interactive confirmation for repo-wide replacements and offer a `--dry-run` mode that lists changes only.
  - Rationale: Safety and auditability are important; git branch + single commit requirement supports reversibility.

- Decision: Scale/Scope — feature targets single repo migration and ongoing usage; expected change-set sizes vary. Nothing requiring distributed coordination.

## Research Tasks generated (Phase 0)

For traceability and future automation we turn each unresolved item into a short research task (these can be run by agent workflows or manually):

- Research Task: "Confirm Node/TypeScript versions compatible with existing repo and CI (suggest Node 20, TS 5)" — verify package.json engines / CI images.
- Research Task: "Best practices for safely performing repo-wide token replacement with git branch + single commit (dry-run, preview, scope filters)" — include use of `git` and `fs-extra` transactional patterns.
- Research Task: "Design the constitution amendment format and version bump strategy (metadata shape)" — ensure machine-readable entries for `Acronyms` + `BranchConfig`.
- Research Task: "Decaf MCP server integration patterns for Jira creation/mapping" — how to call and fallback best practices.
- Research Task: "CLI UX for interactive opt-in renames and dry-run flows" — design prompts, non-blocking defaults, and logging.

## Alternatives considered (short)

- Use of a remote service (DB or API) to store acronyms: rejected (adds infra and auth complexity).
- Automatic branch renaming across many branches: rejected for MVP due to risk and possible merge conflicts — provide opt-in proposals per-branch.
- Using regex-only replacement engine vs AST-based repairs: regex is pragmatic for templates and headings; for code or structured files consider AST-aware transforms in follow-up.

## Next steps (for Phase 1 inputs)

- From this research, populate `data-model.md` (AcronymConfig, BranchConfig, JiraMapping shapes) and `contracts/` (if any API endpoints or CLI interfaces need explicit schema). Generate `quickstart.md` describing the user flow: configure acronyms → dry-run → apply changes → create PR.
- Run the agent-context update script so Copilot (or other configured agents) has the new technology entries in its context (add `Acronyms` and `JiraMapping` sections to agent context markers).

---

Generated by plan automation on branch: `001-configurable-acronyms-jira-integration`.
