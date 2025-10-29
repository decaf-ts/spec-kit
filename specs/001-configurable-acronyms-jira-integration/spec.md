```markdown
# Feature Specification: Configurable Acronyms & Jira Integration

**Feature Branch**: `001-configurable-acronyms-jira-integration`
**Created**: 2025-10-28
**Status**: Draft
**Input**: User description: "Enhance SpecKit with configurable acronyms, branch naming, Jira mapping, and Decaf-TS integrations; add a command to update acronyms across project; persist in constitution.md"

## User Scenarios & Testing *(mandatory)*

### [USR-001] User Story 1 - Configure Acronyms (Priority: P1)

As a project maintainer, I want to define custom acronyms for spec artefacts (Requirements, User Stories, Features, Scoring Criteria) so that the team can adopt its existing naming conventions and traceability to external tools (e.g., Jira).

Why this priority: Enables teams to align SpecKit with organizational conventions and ensures traceability.

Independent Test: Run the acronym configuration flow and verify that templates and a newly-created spec use the configured prefixes (e.g., REQ-1, USR-1, FTR-1, TC-1).

Acceptance Scenarios:

1. Given a new project, When the user runs the acronym setup, Then defaults are suggested and saved to `memory/constitution.md`.
2. Given existing templates, When defaults are accepted, Then placeholders and template outputs reflect the chosen acronyms.

---

### [USR-002] User Story 2 - Update Acronyms Across Repo (Priority: P1)

As a maintainer, I want a single command to update acronyms across the repository so that legacy specs and templates can be migrated consistently and safely.

Why this priority: Prevents manual, error-prone edits and ensures consistent naming and numbering across docs and branch conventions.

Independent Test: Run the new `speckit.updateAcronyms` flow in a feature branch and verify a commit that updates constitution, templates, and (optionally) spec files; verify a version bump is recorded.

Acceptance Scenarios:

1. Given a proposed acronym change, When the user confirms, Then a new branch (e.g., `chore/update-acronyms`) is created and changes are committed.
2. Given existing spec files, When user opts-in, Then occurrences of old prefixes in headings/list identifiers are replaced and a summary of affected files is shown.

---

### [USR-003] User Story 3 - Branch Naming & Jira Mapping (Priority: P1)

As a developer, I want branch names to be tied to configured acronyms and Jira IDs so that branches map directly to Jira tickets (e.g., SPEC-102) and merge/CI policies may rely on this structure.

Why this priority: Strong traceability between code and work items improves audits and process automation.

Independent Test: Create a new feature via the SpecKit flow that requests or creates a Jira issue; verify the created branch name equals the Jira key and that validation enforces the pattern.

Acceptance Scenarios:

1. Given a configured mapping of acronym→Jira issue type, When creating a new spec item, Then the tool either links to an existing Jira key or creates a new Jira issue and uses its key as the spec/branch identifier.
2. Given an attempted branch creation with an invalid name, When validation runs, Then the user receives a clear error and suggested correction.

---

### Edge Cases

- Network or Jira API failures when attempting to create or resolve tickets: fall back to local numbering and mark the spec with a warning to reconcile later.
- Projects that use Jira keys not matching desired acronyms: provide a mapping table and allow a readable alias (see clarifications).
- Existing specs with free-form identifiers: require explicit opt-in to update file contents; otherwise only new specs/templates are affected.

## Requirements *(mandatory)*

### Functional Requirements

- **ACR-001**: System MUST allow defining a mapping of artifact types to acronyms. Example artifact types: Requirement, User Story, Feature, Scoring Criteria, Checklist Item.
- **ACR-002**: Defaults MUST be loaded from the official SpecKit templates on initialization. Defaults include at minimum: Requirement=FR, User Story=USR, Success Criteria=SC, Scoring Criteria=TC.
- **ACR-003**: The system MUST prompt the user to confirm defaults and allow overriding them during setup or via the update command.
- **ACR-004**: Chosen acronyms MUST be persisted in `memory/constitution.md` under a dedicated `Acronyms` section and include metadata (author, timestamp, version bump entry).
- **ACR-005**: Templates in `templates/` MUST use placeholders that are resolved to the configured acronyms when generating spec files. Existing placeholder patterns must be updated to be dynamic (no hard-coded FR/USR/etc.).
- **ACR-006**: Numbering sequences MUST be maintained per artifact type and rendered as `<ACRONYM>-<sequential-number>`; cross-references inside specs MUST use updated prefixes.
- **ACR-007**: Provide a CLI/assistant command `speckit.updateAcronyms` (or similar) that: suggests defaults, accepts overrides, updates `.specify/memory/constitution.md`, updates `templates/`, and optionally scans & updates existing spec files.
- **ACR-008**: Running the acronym update that modifies project files MUST create a feature branch, commit changes, and increment the constitution version. The operation must be reversible via normal git workflows.
- **ACR-009**: Branch naming configuration MUST be persisted in the constitution (a mapping selecting which artifact acronym to use for branches). The enforced branch name format is `<ACRONYM>-<JIRA_OR_SEQUENCE>`.
- **ACR-010**: When creating or switching to a branch for a new spec/feature, SpecKit MUST validate the branch name matches `<ACRONYM>-<number>` for a configured acronym and either warn or refuse otherwise.
- **ACR-011**: SpecKit operations that involve spec loading, tool execution, Jira/agent orchestration, or any constitution-driven automation MUST use `@decaf-ts/mcp-server` as the orchestration and authentication layer. Implementations SHALL perform MCP discovery on first-run (constitution initialization) and consult `.specify/memory/mcp-tools.md` for permitted tools and integrations. Any CLI/UX flag that suggests disabling MCP MUST only enable a documented local testing stub (for offline developer testing) and MUST present a clear, persistent warning that this mode is not permitted for constitution-driven or production workflows unless a constitution amendment explicitly authorizes it.
- **ACR-012**: Integrations with Jira MUST attempt to use `@decaf-ts/mcp-server` for authentication and interactions. If MCP is unavailable, the implementation MUST fail fast with a clear user-facing error and remediation steps (for example: verify MCP connectivity or credentials). Silent fallback to local numbering or non-MCP behaviors is disallowed for constitution-driven workflows. Any permitted fallback behavior must be introduced via a constitution amendment that documents the scope, approvals, and audit requirements; fallback actions must be auditable, written into `.specify/memory/constitution.md`, and include a remediation plan.
- **ACR-013**: Provide a mapping configuration `Acronym -> JiraIssueType` in the constitution. This mapping is used when creating Jira issues for Specs, Features, and Scoring Criteria.
- **ACR-014**: When creating a spec element, the workflow MUST prompt for an existing Jira key or create a Jira issue of the mapped issue type and use the returned key as the spec identifier.
- **ACR-015**: All changes to acronyms, branch mapping, or Decaf toggle MUST be treated as constitution amendments and trigger a version bump recorded in constitution metadata.

### Non-functional Requirements

- **ACR-NF-001**: Acronym update operations that change many files MUST be performed in a single git branch/commit so they can be reviewed and reverted.
- **ACR-NF-002**: The update command must provide a dry-run mode reporting the files and replacements it will change.
- **ACR-NF-003**: All Jira API interactions MUST surface clear user-facing errors and recommend remediation steps (credentials, permissions, network), and must never silently drop mapping changes.

### Key Entities

- **AcronymConfig**: { artifactType: string, acronym: string, createdBy: string, createdAt: date, version: string }
- **BranchConfig**: { branchAcronym: string, enforcePattern: string }
- **JiraMapping**: { acronym: string, jiraIssueType: string, jiraProjectKey?: string }

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of new templates generated after running configuration use the new acronyms.
- **SC-002**: `speckit.updateAcronyms --dry-run` reports files and replacements with zero false positives for a representative sample (3 template files and 3 spec files).
- **SC-003**: When acceleration integration is enabled and available, at least one supported acceleration utility is used during code generation (if applicable) and its use is indicated in commit messages or spec header metadata.
- **SC-004**: 95% of users in a small pilot (3 projects) can successfully create a Jira-linked spec and matching branch using the flow without manual branch renaming.

## Assumptions

- Jira projects and keys can be mapped to acronyms, or teams will accept aliasing via the mapping table.
- Decaf MCP server is available in the environment or can be configured; when unavailable, local fallbacks are acceptable.
- Existing spec files may have varied formats; migration is opt-in and requires user confirmation.

## Decisions & Resolutions

The following decisions were provided by the project owner and are incorporated into this specification. These resolve the previous clarification markers.

1. Acronym → Jira Key Mapping (Decision: B)

   - Policy: SpecKit allows independent, user-defined acronyms and maintains a configurable mapping from Acronym → Jira project/key. This enables teams to choose readable or legacy acronyms while retaining direct integrations with Jira projects.
   - Implication: When creating or linking Jira issues, SpecKit will translate the chosen acronym to the configured Jira project/key. Branch names and spec identifiers will use the Jira issue key where available; the user-facing acronym will appear in documentation where configured.

2. Branch Naming Enforcement (Decision: Branch name = Jira ticket)

   - Policy: Branch names MUST correspond to the Jira ticket key for the work item (for example `PROJ-123` or `SPEC-45`), and SpecKit will enforce validation that a branch name matches a configured acronym mapping and a numeric/key suffix.
   - Renaming policy (assumption): SpecKit will not automatically rename existing git branches by default. The acronym update command offers an opt-in, interactive renaming mode that proposes branch renames and requires explicit user confirmation per-branch. This keeps migration safe while allowing teams to adopt the new convention when ready.

These decisions are persisted in the migration plan and will be added to `.specify/memory/constitution.md` as a constitution amendment (see Migration Plan step 1).

3. Jira creation flow (Clarified):

   - Policy: SpecKit will always prompt the user during spec creation or acronym updates when a Jira action is required. The workflow will ask the user to provide an existing Jira key or confirm creation of a new Jira issue. SpecKit will not perform background automatic Jira issue creation without explicit user consent.

   - Implication: This reduces unexpected automated changes and ensures credentials/permissions are verified interactively. Automation hooks (e.g., Decaf MCP server) will only run after the user confirms the action.

## Clarifications

### Session 2025-10-28

- Q: When creating or linking Jira issues as part of spec creation or acronym updates, should SpecKit create Jira issues automatically when credentials/configured and consent is available? → A: Option B - Always prompt the user during spec creation: ask for an existing Jira key or create a new issue (no background automatic creation).

- Q: What should the default/override policy for branch naming be? → A: Option D - Configurable per-repo (default to "SPEC"). This allows repository-level choice stored in the constitution and reduces migration friction.

- Q: How should Jira authentication be handled for creating/linking issues? → A: Use `@decaf-ts/mcp-server` for Jira authentication and interactions; the new project will rely on that MCP integration.

- Q: Where should `speckit.updateAcronyms` run and how should it be tested? → A: It is intended to run in consumer projects that use this SpecKit implementation (not in this repository). For testing, the command must support pointing to a temporary target directory containing dummy markdown files; tests should run in dry-run or controlled apply mode and delete the temp folder after the test passes.

## Migration Plan

1. Add `Acronyms` and `BranchNaming` sections to `.specify/memory/constitution.md` (this spec includes proposed text).
2. Implement `speckit.updateAcronyms` as a CLI flow that:
   - Loads defaults from `templates/`
   - Prompts user for confirmation/overrides
   - Runs a dry-run showing affected files
   - On confirmation, creates `chore/update-acronyms` branch, applies changes, commits, and bumps constitution version
   - Interaction: The update flow MUST prompt the user when Jira integration is involved — the CLI will ask for an existing Jira key or whether to create a new Jira issue. Background/automatic Jira issue creation without explicit user confirmation is NOT performed by default.
   - Intended runtime & testing: `speckit.updateAcronyms` is intended to be executed in consumer projects that adopt SpecKit (not run inside this spec-kit repository itself). The command MUST accept a target directory parameter to point at project files. For automated tests, callers should create a temporary folder containing dummy markdown files, run the flow in `--dry-run` (or controlled `--apply`) mode against that folder, assert expected replacements, and delete the temp folder after tests pass.
3. Update template placeholders to use dynamic acronym tokens (e.g., `{{ACRONYM:Requirement}}-{{NUMBER}}`).
4. Provide Jira hookup via Decaf MCP utilities; on failure, mark specs as `Jira: pending` and use local numbering.

---

**Spec ready for planning**

```
