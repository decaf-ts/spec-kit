Remediation proposal: top-3 issues (C1, C2, add task for ACR-011)

Summary
-------
This file contains concrete, ready-to-apply edits for three blocking issues found by the analysis:

- C1: Canonical constitution storage path mismatch (use `.specify/memory/constitution.md`)
- C2: Governance conflict about mandatory MCP usage vs spec toggle/fallback
- M1: Missing task to persist/control MCP toggle (`ACR-011`) — add task `T028`

I provide suggested text replacements for `spec.md` and `tasks.md` and a new task entry you can apply directly. I did NOT modify the original files — this is a draft. If you'd like, I can apply these edits as a patch.

Proposed edits (ready-to-apply)
-------------------------------

1) Canonical path unification (C1)

Replace all occurrences of `memory/constitution.md` in the feature spec and tasks with the canonical `.specify/memory/constitution.md` path.

Suggested patch snippets (apply to the files below):

*** Update File: /specs/001-configurable-acronyms-jira-integration/spec.md
@@
-**ACR-004**: Chosen acronyms MUST be persisted in `memory/constitution.md` under a dedicated `Acronyms` section and include metadata (author, timestamp, version bump entry).
+**ACR-004**: Chosen acronyms MUST be persisted in `.specify/memory/constitution.md` under a dedicated `Acronyms` section and include metadata (author, timestamp, version bump entry).
@@
-These decisions are persisted in the migration plan and will be added to `memory/constitution.md` as a constitution amendment (see Migration Plan step 1).
+These decisions are persisted in the migration plan and will be added to `.specify/memory/constitution.md` as a constitution amendment (see Migration Plan step 1).
@@
-1. Add `Acronyms` and `BranchNaming` sections to `memory/constitution.md` (this spec includes proposed text).
+1. Add `Acronyms` and `BranchNaming` sections to `.specify/memory/constitution.md` (this spec includes proposed text).

*** Update File: /specs/001-configurable-acronyms-jira-integration/tasks.md
@@
-- [ ] T001 [P] Create or validate `memory/constitution.md` file and add placeholder sections `Acronyms:` and `BranchConfig:` if missing — memory/constitution.md
+- [ ] T001 [P] Create or validate `.specify/memory/constitution.md` file and add placeholder sections `Acronyms:` and `BranchConfig:` if missing — .specify/memory/constitution.md
@@
-- [ ] T011 [P] [US1] Add initial `Acronyms` YAML block to `memory/constitution.md` with default values (Requirement=FR, User Story=USR, Feature=FTR, Scoring=TC) — memory/constitution.md
+- [ ] T011 [P] [US1] Add initial `Acronyms` YAML block to `.specify/memory/constitution.md` with default values (Requirement=FR, User Story=USR, Feature=FTR, Scoring=TC) — .specify/memory/constitution.md

Note: search the repo for `memory/constitution.md` occurrences and update them similarly if you decide to apply.

2) MCP usage & fallback clarification (C2)

Problem: The spec currently includes ACR-011 and ACR-012 that allow disabling MCP usage and falling back to local numbering. The constitution's Principle I requires MCP usage for spec loading, tool execution and agent orchestration, causing a governance conflict.

Recommended change in `spec.md` (replace ACR-011 & ACR-012 with clarified text):

*** Update File: /specs/001-configurable-acronyms-jira-integration/spec.md
@@
-- **ACR-011**: Provide configuration to enable/disable use of `@decaf-ts/mcp-server` accelerated features. Defaults to enabled.
-- **ACR-012**: Integrations with Jira MUST use `@decaf-ts/mcp-server` for authentication and interactions where available; when unavailable or failing, fall back to local numbering with an explicit warning logged into the spec header.
+- **ACR-011**: Use of `@decaf-ts/mcp-server` is required for any operation that involves spec loading, tool execution, or agent orchestration as mandated by the project constitution (Principle I). Implementations MUST default to MCP-enabled. If a project requires a non-MCP mode for local testing or experimentation, that mode must be documented, gated behind a formal constitution amendment, and limited to non-production/testing workflows. Any UI/CLI flag that suggests disabling MCP MUST only enable a local testing stub and MUST present a clear, persistent warning that this mode is not permitted for constitution-driven operations.
+- **ACR-012**: Integrations with Jira MUST attempt to use `@decaf-ts/mcp-server` for authentication and interactions. In the event of MCP-unavailability, the implementation MUST either: (a) refuse the operation and instruct the user to resolve MCP connectivity, or (b) if an approved constitution amendment exists allowing a documented fallback, perform a local numbering fallback while recording `Jira: pending` in the spec header and writing an explicit migration note in `.specify/memory/constitution.md`. All fallback behavior must be auditable and reversible.

Rationale: this preserves the constitution's non-negotiable requirements while allowing controlled, documented fallbacks via constitution amendments only.

3) Add explicit task for ACR-011 toggle persistence (M1/T028)

Add a new Foundational task to persist the MCP-enable flag and to ensure the CLI surface and tests exist. Insert the task after T010 in `tasks.md`.

*** Update File: /specs/001-configurable-acronyms-jira-integration/tasks.md
@@
 - [ ] T010 [P] Add a CLI command skeleton for the update flow `src/cli/updateAcronyms.ts` (exposes `--dry-run`, `--apply`, `--branch`) — src/cli/updateAcronyms.ts
+ - [ ] T028 [P] Persist MCP enablement flag: Add `decafMcpEnabled: true` to `.specify/memory/constitution.md` defaults, implement read/write helpers in `src/lib/constitution.ts`, expose CLI flags `--mcp-enabled/--no-mcp` (for local testing only), and add unit tests to ensure operations that require MCP refuse to proceed when MCP is disabled unless a constitution amendment is present — .specify/memory/constitution.md, src/lib/constitution.ts, tests/unit/constitutionMcpFlag.test.ts

Notes & follow-ups
------------------
- If you prefer the alternate approach (amend the constitution to allow `memory/constitution.md` as an allowed storage location), I can prepare the constitution amendment text and the change set instead.
- If you want me to apply the edits directly, reply: "Apply patch" and I'll run the changes (I will update `T001/T011` etc. and run quick repo grep to ensure all `memory/constitution.md` occurrences are updated). Otherwise review this proposal and tell me what to change.

Proposed checklist for apply (what I will do if you say "Apply patch")
---------------------------------------------------------------------
1. Run a repository-wide grep for `memory/constitution.md` and make a list of files to update.
2. Apply the textual replacements in `spec.md` and `tasks.md` (and any additional files you accept).
3. Update tests or task items if default acronym list needs reconciliation (Feature vs Success Criteria wording).
4. Run `git status` and show the diff for your review before committing.

---

Generated: 2025-10-28

