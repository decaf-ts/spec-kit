<!--
Sync Impact Report

Version change: unknown → 1.0.0
Modified principles:
- PRINCIPLE_1_NAME (template) → "I. Library-First & Type Safety"
- PRINCIPLE_2_NAME (template) → "II. CLI & Tooling Contract"
- PRINCIPLE_3_NAME (template) → "III. Test-First (NON-NEGOTIABLE)"
- PRINCIPLE_4_NAME (template) → "IV. Integration & Contract Testing"
- PRINCIPLE_5_NAME (template) → "V. Observability, Versioning & Simplicity"
Added sections:
- Development Workflow
- Compliance & Release Policy
Removed sections:
- None
Templates requiring updates:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated
- templates/commands/tasks.md ✅ updated (referencing decaf-ts guidance)
Follow-up TODOs:
- RATIFICATION_DATE: TODO (original ratification date unknown)
-->

# Decaf Spec Kit Constitution

## Core Principles

### I. Library-First & Type Safety
All new features MUST be created as modular packages (monorepo-friendly) with clear public
APIs. Each package MUST include a minimal surface area, explicit types, and a focused test
surface. Rationale: decaf-ts projects rely on strong static typing and composable packages to
enable safe refactors and clear upgrade paths.

### II. CLI & Tooling Contract
All runtime developer workflows MUST be automatable via the CLI (the `specify` tool and any
project-provided scripts). Tooling MUST expose deterministic, scriptable interfaces (stdin/args
→ stdout/exit codes) and support both human-readable and machine-readable outputs (JSON).
Rationale: predictable CLI contracts make the project reproducible and easier for LLM-driven
automation to consume.

### III. Test-First (NON-NEGOTIABLE)
Tests MUST be written before implementation for any non-trivial behavior. The accepted flow is:
1) Write tests (unit/contract/integration) → 2) See failing tests → 3) Implement minimal code →
4) Refactor while keeping tests green. Rationale: Ensures correctness, reduces regressions, and
enables reliable LLM-driven implementation steps.

### IV. Integration & Contract Testing
All cross-package interactions and public HTTP/gRPC contracts MUST have integration or contract
tests. Contract tests are prioritized for library boundaries and third-party integrations. Rationale:
Early detection of interface mismatches avoids costly rollbacks and keeps automated flows safe.

### V. Observability, Versioning & Simplicity
Every package MUST include structured logging, clear error codes, and minimal, documented
telemetry points. Versioning MUST follow semantic versioning (MAJOR.MINOR.PATCH). Breaking
changes MUST be gated by a documented upgrade strategy and migration notes. Prefer simple
implementations over cleverness (YAGNI) unless justified in the plan.

## Development Workflow

1. Establish the constitution (this document) early in the project lifecycle.
2. Create a feature specification with `/speckit.specify` (what + why), then run `/speckit.plan`
	for the implementation approach (how).
3. Generate `tasks.md` with `/speckit.tasks`. Tasks MUST map to user stories and be independently
	testable where possible.
4. Implementation SHOULD follow Test-First. CI gates MUST run unit, contract, and critical
	integration tests before merge.

## Compliance & Release Policy

- Code reviews MUST verify that tests were added/updated where behavior changed.
- Releases follow conventional commits and semantic versioning. Use changelogs to document
  breaking changes and migration steps.
- Security-sensitive changes MUST include threat modeling notes and at least one security
  review pass before merging to main.

## Governance

Amendments to this constitution require the following:

1. A proposed amendment document (PR) describing the change, rationale, and migration plan.
2. Approval by a majority of active maintainers (PR review comments + explicit approval).
3. Update the `Last Amended` date and increment `CONSTITUTION_VERSION` per semantic rules:
	- MAJOR: Backward-incompatible governance or principle removals
	- MINOR: New principle/section added or material expansion
	- PATCH: Clarifications, wording fixes, or non-semantic refinements

All PRs that change behavior MUST reference the constitution and include a short note on how
the change conforms to or departs from these principles.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-10-28

