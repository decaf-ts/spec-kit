---
description: "Generated task list for Configurable Acronyms & Jira Integration"
---

# Tasks: Configurable Acronyms & Jira Integration

**Input**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/` in the feature folder

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Create or validate `.specify/memory/constitution.md` file and add placeholder sections `Acronyms:` and `BranchConfig:` if missing — .specify/memory/constitution.md
- [ ] T002 Run MCP discovery and write results to `.specify/memory/mcp-tools.md` so MCP gating/allowed frameworks are recorded — .specify/memory/mcp-tools.md
- [ ] T003 [P] Ensure `templates/` markdown files use placeholder tokens (prepare list) and add a note in `templates/README.md` listing placeholder format `{{ACRONYM:Artifact}}-{{NUMBER}}` — templates/README.md

### Constitution Check (required)

- [ ] T004 Run constitution compliance check: verify `@decaf-ts/mcp-server` usage is permitted per MCP discovery and record results in `.specify/memory/constitution-check.md` — .specify/memory/constitution-check.md
- [ ] T005 If any choice is blocked by the constitution, create `specs/001-configurable-acronyms-jira-integration/notes/constitution-issues.md` documenting required approvals and next steps — specs/001-configurable-acronyms-jira-integration/notes/constitution-issues.md

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T006 Create TypeScript data types for the feature: `src/types/acronyms.ts` (AcronymConfig, BranchConfig, JiraMapping) — src/types/acronyms.ts
- [ ] T007 [P] Implement a small constitution read/write helper to read/write YAML block under `Acronyms` in `.specify/memory/constitution.md` — src/lib/constitution.ts
- [ ] T008 [P] Implement a template placeholder resolver utility `src/lib/templateResolver.ts` that accepts `{{ACRONYM:...}}` tokens and returns resolved strings per constitution — src/lib/templateResolver.ts
- [ ] T009 Add unit tests for the resolver and constitution helper: `tests/unit/templateResolver.test.ts` and `tests/unit/constitution.test.ts` — tests/unit/templateResolver.test.ts, tests/unit/constitution.test.ts
 - [ ] T010 [P] Add a CLI command skeleton for the update flow `src/cli/updateAcronyms.ts` (exposes `--dry-run`, `--apply`, `--branch`) — src/cli/updateAcronyms.ts
 - [ ] T028 [P] Persist MCP enablement flag: Add `decafMcpEnabled: true` to `.specify/memory/constitution.md` defaults, implement read/write helpers in `src/lib/constitution.ts`, expose CLI flags `--mcp-enabled/--no-mcp` (for local testing only), and add unit tests to ensure operations that require MCP refuse to proceed when MCP is disabled unless a constitution amendment is present — .specify/memory/constitution.md, src/lib/constitution.ts, tests/unit/constitutionMcpFlag.test.ts

**Checkpoint**: After Phase 2, the project can run dry-run scans and persist acronym configuration. No user story work should start until these tasks are complete.

## Phase 3: User Story 1 - Configure Acronyms (Priority: P1) 🎯 MVP

**Goal**: Allow a maintainer to define and persist custom acronyms (Requirement, User Story, Feature, Scoring Criteria) and verify templates/spec generation uses those acronyms.

**Independent Test**: Run the configuration CLI flow and verify `.specify/memory/constitution.md` contains an `Acronyms` entry and that `templates/spec-template.md` renders `{{ACRONYM:User Story}}-1` correctly via the resolver.

- [ ] T011 [P] [US1] Add initial `Acronyms` YAML block to `.specify/memory/constitution.md` with default values (Requirement=FR, User Story=USR, Feature=FTR, Scoring=TC) — .specify/memory/constitution.md
- [ ] T012 [US1] Implement interactive CLI flow file `src/cli/configureAcronyms.ts` that suggests defaults, accepts overrides, and persists the result using `src/lib/constitution.ts` — src/cli/configureAcronyms.ts
- [ ] T013 [P] [US1] Implement unit tests that simulate the interactive flow in dry-run and apply modes: `tests/unit/configureAcronyms.test.ts` — tests/unit/configureAcronyms.test.ts
- [ ] T014 [US1] Update `templates/spec-template.md` and `templates/agent-file-template.md` to replace hard-coded acronyms with `{{ACRONYM:...}}` tokens and commit the changes in a feature branch during apply — templates/spec-template.md, templates/agent-file-template.md
- [ ] T015 [US1] Update `specs/001-configurable-acronyms-jira-integration/quickstart.md` with a short example showing the configure flow and expected constitution changes — specs/001-configurable-acronyms-jira-integration/quickstart.md

**Checkpoint**: Configuring acronyms and template rendering should work end-to-end in dry-run and apply modes.

## Phase 4: User Story 2 - Update Acronyms Across Repo (Priority: P1)

**Goal**: Provide a single command to scan the repository, preview replacements (dry-run), and optionally apply changes in one branch/commit.

**Independent Test**: Run `src/cli/updateAcronyms.ts --dry-run --target <tmp-dir>` and verify output JSON `specs/001-configurable-acronyms-jira-integration/update-acronyms-dryrun.json` contains an accurate list of files and replacement counts.

- [ ] T016 [P] [US2] Implement file scanner and replacement plan generator `src/lib/updateScanner.ts` that accepts globs and produces a replacement summary JSON — src/lib/updateScanner.ts
- [ ] T017 [US2] Implement dry-run output writer `specs/001-configurable-acronyms-jira-integration/update-acronyms-dryrun.json` (written by the CLI when `--dry-run` is used) — specs/001-configurable-acronyms-jira-integration/update-acronyms-dryrun.json
- [ ] T018 [US2] Implement apply mode in `src/cli/updateAcronyms.ts` that: creates a branch (default `chore/update-acronyms-<ts>`), applies replacements, commits once, and records branch & commit in the result JSON — src/cli/updateAcronyms.ts
- [ ] T019 [P] [US2] Implement a small git helper `src/lib/gitUtils.ts` used to create branches and do atomic commits (used by apply mode) — src/lib/gitUtils.ts
- [ ] T020 [US2] Add integration tests that run the full flow (dry-run + apply) against a temporary git fixture repo and assert changedFiles and commit exist: `tests/integration/test_updateAcronyms.test.ts` — tests/integration/test_updateAcronyms.test.ts

## Phase 5: User Story 3 - Branch Naming & Jira Mapping (Priority: P1)

**Goal**: Persist branch naming mapping and Jira mapping in the constitution, validate branch names, and integrate with `@decaf-ts/mcp-server` for creating/linking Jira issues with safe fallbacks.

**Independent Test**: Use the branch validator to assert that a branch name `SPEC-123` is accepted when mapping exists; simulate a failing MCP call and verify the CLI falls back to local numbering and writes `Jira: pending` in the spec header.

- [ ] T021 [US3] Add `BranchConfig` and `JiraMapping` example entries to `.specify/memory/constitution.md` (update example block) — .specify/memory/constitution.md
- [ ] T022 [P] [US3] Implement branch name validator utility `src/lib/branchValidator.ts` with function `validateBranchName(branchName:string, config:BranchConfig): boolean` — src/lib/branchValidator.ts
- [ ] T023 [US3] Implement MCP/Jira integration wrapper `src/lib/jira.ts` that uses `@decaf-ts/mcp-server` with clear error messages and a local fallback strategy — src/lib/jira.ts
- [ ] T024 [P] [US3] Add unit and integration tests for branch validation and Jira fallback: `tests/unit/branchValidator.test.ts`, `tests/unit/jira.test.ts` — tests/unit/branchValidator.test.ts, tests/unit/jira.test.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T025 [P] Documentation: Add usage docs and examples to `docs/quickstart.md` and `README.md` demonstrating `speckit.updateAcronyms` and `speckit.configureAcronyms` — docs/quickstart.md, README.md
- [ ] T026 Update `CHANGELOG.md` with a migration note and add an entry in `specs/001-configurable-acronyms-jira-integration/notes/migration-notes.md` describing the recommended rollout — CHANGELOG.md, specs/001-configurable-acronyms-jira-integration/notes/migration-notes.md
- [ ] T027 [P] Add CI integration test job file to run the update flow in dry-run mode for PRs touching `templates/` — .github/workflows/integration-update-acronyms.yml

## Dependencies & Execution Order

- Setup (Phase 1) tasks T001–T005 must be completed first.
- Foundational (Phase 2) tasks T006–T010 block all user story work and must be completed prior to Phase 3+.
- User Stories (Phase 3+) may proceed after Foundational is complete. Each story is designed to be independently testable.

### Story completion order (recommended MVP first)

1. US1 (Configure Acronyms) — MVP
2. US2 (Update Acronyms Across Repo)
3. US3 (Branch Naming & Jira Mapping)

## Parallel execution examples

- Parallelizing Setup: T001, T003 can be executed in parallel by separate contributors because they touch different files (`memory/constitution.md` vs `templates/README.md`).
- Parallelizing Foundational: T007 and T008 (constitution helper and resolver) are independent and safe to run in parallel (different files).
- Per-story parallelism: In US2, scanner (T016) and `gitUtils` (T019) can be developed in parallel by different engineers (both are [P]).

## Implementation strategy (MVP first)

- MVP scope: Only US1 (Configure Acronyms) plus Foundational tasks required to persist and render acronyms (Tasks T006–T015). This allows teams to configure acronyms and verify template rendering before repository-wide changes.
- Incremental delivery: After MVP (US1) is validated, implement US2 dry-run capability (T016–T020). Once dry-run is reliable, enable `--apply` with git branch creation.
- Safety: Always run dry-run and require explicit `--apply` confirmation. Apply mode must create a single branch and commit for all replacements.

## Format validation checklist

- All tasks written above follow the required checklist format: `- [ ] T<ID> [P?] [US?] Description with file path`.

---

Generated by `/speckit.tasks` automation using `plan.md`, `spec.md`, `data-model.md`, and `research.md`.
