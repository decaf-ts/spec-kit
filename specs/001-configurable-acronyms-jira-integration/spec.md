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
- **ACR-007**: Provide a CLI/assistant command `speckit.updateAcronyms` (or similar) that: suggests defaults, accepts overrides, updates `memory/constitution.md`, updates `templates/`, and optionally scans & updates existing spec files.
- **ACR-008**: Running the acronym update that modifies project files MUST create a feature branch, commit changes, and increment the constitution version. The operation must be reversible via normal git workflows.
- **ACR-009**: Branch naming configuration MUST be persisted in the constitution (a mapping selecting which artifact acronym to use for branches). The enforced branch name format is `<ACRONYM>-<JIRA_OR_SEQUENCE>`.
- **ACR-010**: When creating or switching to a branch for a new spec/feature, SpecKit MUST validate the branch name matches `<ACRONYM>-<number>` for a configured acronym and either warn or refuse otherwise.
- **ACR-011**: Provide configuration to enable/disable use of `@decaf-ts/mcp-server` accelerated features. Defaults to enabled.
- **ACR-012**: Integrations with Jira MUST use Decaf MCP server utilities where available; when unavailable or failing, fall back to local numbering with an explicit warning logged into the spec header.
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

## [NEEDS CLARIFICATION: 2 items]

1. [NEEDS CLARIFICATION: Acronym vs Jira Key mapping]  Should acronyms be required to exactly match Jira project keys (so ACRONYM==JIRAKEY), or should SpecKit allow an arbitrary acronym with a configured mapping to a Jira project/key (ACRONYM -> PROJ)? This affects whether branch names can literally be the Jira key or whether we must translate between them.

2. [NEEDS CLARIFICATION: Branch rename policy for existing branches]  When updating acronyms, should the tool offer to rename existing git branches to the new pattern (automatically or with opt-in per-branch), or should it restrict changes to files and only apply the new naming to newly created branches? Renaming branches is potentially destructive and may require CI updates.

## Migration Plan

1. Add `Acronyms` and `BranchNaming` sections to `memory/constitution.md` (this spec includes proposed text).
2. Implement `speckit.updateAcronyms` as a CLI flow that:
   - Loads defaults from `templates/`
   - Prompts user for confirmation/overrides
   - Runs a dry-run showing affected files
   - On confirmation, creates `chore/update-acronyms` branch, applies changes, commits, and bumps constitution version
3. Update template placeholders to use dynamic acronym tokens (e.g., `{{ACRONYM:Requirement}}-{{NUMBER}}`).
4. Provide Jira hookup via Decaf MCP utilities; on failure, mark specs as `Jira: pending` and use local numbering.

---

**Spec ready for planning**

```
