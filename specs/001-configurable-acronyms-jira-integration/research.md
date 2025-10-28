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
