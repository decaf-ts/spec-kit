<!--
Sync Impact Report

- Version change: TEMPLATE -> 1.0.0
- Modified principles:
	- Library → Use Decaf MCP Server & Tools
	- Framework-Supported Tech Only
	- Latest Stable Versions
	- Controlled File Modifications
	- Quality, Testing, and Performance
	- Reject Out-of-Scope Requests
- Added sections: Technology Constraints; Development Workflow & Quality Gates
- Templates requiring updates: ✅ templates/plan-template.md, ✅ templates/spec-template.md, ✅ templates/tasks-template.md
- Follow-up TODOs: TODO(MCP_TOOL_LIST), TODO(MCP_PERSISTENCE_OPTIONS), TODO(MCP_UI_FRAMEWORKS), TODO(RATIFICATION_DATE)
-->

# spec-kit Constitution

This constitution defines non-negotiable rules and governance for projects initialized
under the Spec Kit using the Decaf framework. It is intended to be authoritative for
planning, specifying, and implementing features; where the constitution conflicts with
other project artifacts, the constitution governs until formally amended.

## Core Principles

### I. Use Decaf MCP Server & Tools (NON-NEGOTIABLE)
All operations that involve spec loading, tool execution, prompt/context gathering,
or agent orchestration MUST be performed through the `@decaf-ts/mcp-server` and the
Decaf MCP toolchain. During project initialization and any constitution-driven
checkpoints, the assistant (or operator) MUST query the MCP server to discover the
available tools, resources, and agent prompts and record those discoveries in project
memory. Implementations that bypass or reimplement MCP functionality are prohibited.

Rationale: Centralizing orchestration through the MCP server ensures consistent
capabilities, access control, and observable tool execution across all Spec Kit
projects.

Principle I (Operational assumption — MCP discovery on first-run)
For concrete SpecKit implementations, the runtime environment is expected to
have access to the `@decaf-ts/mcp-server`. Implementations MUST perform an MCP
discovery during the first effective run of the constitution initialization
(the initial `constitution` or `setup` step). The discovery records available
MCP tools, allowed persistence and UI frameworks, and any Decaf platform
constraints into `.specify/memory/mcp-tools.md`. After discovery completes, the
project will treat MCP as the authoritative orchestration layer for spec
loading, tool execution, prompt/context gathering, and agent orchestration.

Operational consequences:
- Implementations SHALL assume MCP availability for constitution-driven
	operations; code paths that require MCP MUST fail fast with a clear
	user-facing error if MCP is unavailable, and must not silently fall back to
	non-MCP behaviors.
- Any temporary or local-only testing modes that bypass MCP are not permitted
	for production or constitution-driven operations unless a formal
	constitution amendment documents and approves them (see Governance). Local
	stubs for developer testing must be clearly labeled, gated behind tests and
	CI safeguards, and must not be used in CI/production pipelines.
- The MCP discovery artifact `.specify/memory/mcp-tools.md` is authoritative
	for permitted technologies and must be consulted by plan-checks and gating
	scripts.

### II. Framework-Supported Tech Only (NON-NEGOTIABLE)
All chosen technologies (persistence layers, UI frameworks, core libraries, and
deployment platforms) MUST be drawn exclusively from the set of technologies
explicitly supported by the Decaf framework as reported by the MCP server.

During constitution setup the assistant MUST query the MCP server and record the
supported persistence layers and UI frameworks. Any spec, plan, or task that
recommends a technology outside the MCP-provided set is out-of-scope and MUST be
rejected or replaced with an allowed alternative.

Rationale: This prevents unsupported, fragile, or non-standard stacks from being
introduced, and keeps maintenance and compatibility predictable.

### III. Latest Stable Versions
All Decaf modules and first-party dependencies used in this project MUST be the
latest stable releases at time of initialization or the latest stable release at
time of dependency updates. Experimental, pre-release, or deprecated features of
the Decaf framework MUST NOT be used unless an explicit, documented exception is
approved through the amendment process.

Rationale: Using stable releases minimizes unexpected breakage and ensures
consistent developer experience across teams.

### IV. Controlled File Modifications
Automated or assistant-driven changes are restricted to safe documentation and
memory areas. Files under `./templates/**/*.md` and `./.specify/memory/**/*.md`
may be created or modified by the assistant without additional approval. Any
changes to source code, build scripts, or other project files outside these
directories require explicit user approval before the assistant proceeds.

Rationale: This protects critical code and operational scripts from unintended
automated edits while allowing the assistant to maintain planning and documentation.

### V. Quality, Testing, and Performance
All work must emphasize maintainable, well-tested, and performant code. Specifications
and implementations MUST include measurable success criteria, tests (unit +
integration/contract as appropriate), linting, and a performance plan that is
consistent with Decaf best practices. Tests SHOULD be written early (preferably as
part of the spec and task definitions) and pass before merge to protected branches.

Rationale: Enforcing quality gates reduces regressions and improves long-term
maintainability of delivered features.

### VI. Reject Out-of-Scope Requests
The assistant MUST refuse feature requests or implementation plans that require
technologies, tools, or processes not supported by the Decaf framework. When
rejecting, the assistant MUST provide a clear reason and suggest an alternative
from the permitted Decaf ecosystem.

Rationale: Keeps the project within supported operational boundaries and provides
clear guidance to requesters.

## Technology Constraints

The project MUST discover and record the MCP-provided toolset at constitution
initialization time.

- MCP Tool Discovery: The assistant MUST run an MCP discovery during setup and
	record: tool names, versions, and short descriptions in `.specify/memory/mcp-tools.md`.
	(TODO(MCP_TOOL_LIST): Populate by running the MCP server discovery command.)
- Supported persistence options: TODO(MCP_PERSISTENCE_OPTIONS) — to be filled by
	MCP query. Only these options are allowed for data storage.
- Supported UI frameworks: TODO(MCP_UI_FRAMEWORKS) — to be filled by MCP query.
	Only these frameworks are allowed for frontend work.

If any downstream artifact references a technology not listed above, the assistant
must mark the artifact as non-compliant and propose a compliant replacement.

## Development Workflow & Quality Gates

- Constitution Check: Every `plan.md` MUST include a "Constitution Check"
	section that verifies MCP usage and technology compliance. See templates for
	the enforcement checklist.
- Approvals: Any deviation that would modify these core principles requires a
	documented amendment and explicit approval by the project maintainers (see
	Governance below).
- File modification policy: Templates and memory files may be changed by the
	assistant. Any proposed change to code, scripts, or CI workflows outside the
	allowed directories MUST include an explicit approval step recorded in the
	plan and the PR description.

## Governance

Amendments to this constitution require:

1. Proposal: A documented proposal in `/workdocs/constitution/amendments/` that
	 describes the change, justification, migration plan, and test strategy.
2. Review: Approval by a majority of the active maintainers (defined in
	 `CODEOWNERS` or project governance doc) and a successful compatibility review
	 run via the MCP server where applicable.
3. Implementation: Migration tasks and update of dependent templates and memory
	 artifacts.

Versioning policy:

- MAJOR version: Breaking governance changes (principle removal or redefinition).
- MINOR version: New principles or materially expanded requirements.
- PATCH version: Wording clarifications, typos, or non-semantic refinements.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-10-28

